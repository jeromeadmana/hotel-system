const db = require('../config/db');
const { generateTemplateCode } = require('../utils/codeGenerator');

/**
 * Get all room templates (admin-only)
 * @param {string} locationId - Optional location filter
 * @returns {Promise<Array>} List of templates
 */
const getAllTemplates = async (locationId = null) => {
  let query = `
    SELECT
      rt.*,
      l.name as location_name,
      l.city as location_city,
      u.first_name as created_by_first_name,
      u.last_name as created_by_last_name,
      (SELECT COUNT(*) FROM rooms WHERE template_id = rt.id) as room_count
    FROM room_templates rt
    LEFT JOIN locations l ON rt.location_id = l.id
    LEFT JOIN users u ON rt.created_by = u.id
    WHERE 1=1
  `;

  const params = [];

  if (locationId) {
    query += ' AND rt.location_id = ?';
    params.push(locationId);
  }

  query += ' ORDER BY rt.created_at DESC';

  const [templates] = await db.query(query, params);

  // Parse JSON fields if they're strings (MySQL2 may auto-parse JSON columns)
  return templates.map(template => ({
    ...template,
    amenities: typeof template.amenities === 'string' ? JSON.parse(template.amenities) : (template.amenities || []),
    images: typeof template.images === 'string' ? JSON.parse(template.images) : (template.images || []),
    policies: typeof template.policies === 'string' ? JSON.parse(template.policies) : (template.policies || {})
  }));
};

/**
 * Get template by ID
 * @param {string} templateId - Template UUID
 * @returns {Promise<Object>} Template details
 */
const getTemplateById = async (templateId) => {
  const [templates] = await db.query(`
    SELECT
      rt.*,
      l.name as location_name,
      l.city as location_city,
      u.first_name as created_by_first_name,
      u.last_name as created_by_last_name,
      (SELECT COUNT(*) FROM rooms WHERE template_id = rt.id) as room_count
    FROM room_templates rt
    LEFT JOIN locations l ON rt.location_id = l.id
    LEFT JOIN users u ON rt.created_by = u.id
    WHERE rt.id = ?
  `, [templateId]);

  if (templates.length === 0) {
    return null;
  }

  const template = templates[0];

  // Parse JSON fields if they're strings (MySQL2 may auto-parse JSON columns)
  return {
    ...template,
    amenities: typeof template.amenities === 'string' ? JSON.parse(template.amenities) : (template.amenities || []),
    images: typeof template.images === 'string' ? JSON.parse(template.images) : (template.images || []),
    policies: typeof template.policies === 'string' ? JSON.parse(template.policies) : (template.policies || {})
  };
};

/**
 * Create a new room template
 * @param {Object} templateData - Template details
 * @param {string} createdBy - User ID creating the template
 * @returns {Promise<Object>} Created template
 */
const createTemplate = async (templateData, createdBy) => {
  const {
    location_id,
    template_name,
    public_name,
    room_type,
    description,
    long_description,
    max_occupancy,
    bed_type,
    size_sqft,
    amenities,
    images,
    policies,
    base_price
  } = templateData;

  // Generate template code
  const template_code = generateTemplateCode(room_type, templateData.location_code || 'GEN');

  // Insert template
  const [result] = await db.query(`
    INSERT INTO room_templates (
      id, template_code, location_id, template_name, public_name,
      room_type, description, long_description, max_occupancy,
      bed_type, size_sqft, amenities, images, policies,
      base_price, created_by
    ) VALUES (
      UUID(), ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?
    )
  `, [
    template_code,
    location_id,
    template_name,
    public_name,
    room_type,
    description || null,
    long_description || null,
    max_occupancy,
    bed_type || null,
    size_sqft || null,
    amenities ? JSON.stringify(amenities) : null,
    images ? JSON.stringify(images) : null,
    policies ? JSON.stringify(policies) : null,
    base_price || null,
    createdBy
  ]);

  // Get the created template
  const [templates] = await db.query('SELECT id FROM room_templates WHERE template_code = ?', [template_code]);
  return getTemplateById(templates[0].id);
};

/**
 * Update a room template
 * @param {string} templateId - Template UUID
 * @param {Object} templateData - Updated template data
 * @param {boolean} applyToRooms - Whether to apply changes to existing rooms
 * @returns {Promise<Object>} Updated template
 */
const updateTemplate = async (templateId, templateData, applyToRooms = false) => {
  const {
    template_name,
    public_name,
    description,
    long_description,
    max_occupancy,
    bed_type,
    size_sqft,
    amenities,
    images,
    policies,
    base_price,
    is_active
  } = templateData;

  // Update template
  await db.query(`
    UPDATE room_templates
    SET
      template_name = ?,
      public_name = ?,
      description = ?,
      long_description = ?,
      max_occupancy = ?,
      bed_type = ?,
      size_sqft = ?,
      amenities = ?,
      images = ?,
      policies = ?,
      base_price = ?,
      is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    template_name,
    public_name,
    description || null,
    long_description || null,
    max_occupancy,
    bed_type || null,
    size_sqft || null,
    amenities ? JSON.stringify(amenities) : null,
    images ? JSON.stringify(images) : null,
    policies ? JSON.stringify(policies) : null,
    base_price || null,
    is_active !== undefined ? is_active : true,
    templateId
  ]);

  // Apply changes to existing rooms if requested
  if (applyToRooms) {
    await syncTemplateToRooms(templateId);
  }

  return getTemplateById(templateId);
};

/**
 * Sync template changes to all linked rooms
 * Only updates fields that haven't been overridden
 * @param {string} templateId - Template UUID
 * @returns {Promise<number>} Number of rooms updated
 */
const syncTemplateToRooms = async (templateId) => {
  // Get template data
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  // Get all rooms linked to this template
  const [rooms] = await db.query(`
    SELECT id, override_flags
    FROM rooms
    WHERE template_id = ? AND is_active = TRUE
  `, [templateId]);

  let updateCount = 0;

  for (const room of rooms) {
    const overrideFlags = typeof room.override_flags === 'string' ? JSON.parse(room.override_flags) : (room.override_flags || {});

    // Build update query for non-overridden fields
    const updates = [];
    const params = [];

    if (!overrideFlags.description) {
      updates.push('description = ?');
      params.push(template.description);
    }

    if (!overrideFlags.long_description) {
      updates.push('long_description = ?');
      params.push(template.long_description);
    }

    if (!overrideFlags.amenities) {
      updates.push('amenities = ?');
      params.push(JSON.stringify(template.amenities));
    }

    if (!overrideFlags.images) {
      updates.push('images = ?');
      params.push(JSON.stringify(template.images));
    }

    if (!overrideFlags.policies) {
      updates.push('policies = ?');
      params.push(JSON.stringify(template.policies));
    }

    if (!overrideFlags.bed_type) {
      updates.push('bed_type = ?');
      params.push(template.bed_type);
    }

    if (!overrideFlags.size_sqft) {
      updates.push('size_sqft = ?');
      params.push(template.size_sqft);
    }

    if (!overrideFlags.max_occupancy) {
      updates.push('max_occupancy = ?');
      params.push(template.max_occupancy);
    }

    // Only update if there are changes
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(room.id);

      await db.query(`
        UPDATE rooms
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);

      updateCount++;
    }
  }

  return updateCount;
};

/**
 * Delete a room template
 * Can only delete if no rooms are linked to it
 * @param {string} templateId - Template UUID
 * @returns {Promise<boolean>} Success status
 */
const deleteTemplate = async (templateId) => {
  // Check if any rooms are using this template
  const [rooms] = await db.query(`
    SELECT COUNT(*) as count
    FROM rooms
    WHERE template_id = ?
  `, [templateId]);

  if (rooms[0].count > 0) {
    throw new Error(`Cannot delete template: ${rooms[0].count} room(s) are using this template`);
  }

  // Delete template
  await db.query('DELETE FROM room_templates WHERE id = ?', [templateId]);
  return true;
};

/**
 * Get rooms created from a specific template
 * @param {string} templateId - Template UUID
 * @returns {Promise<Array>} List of rooms
 */
const getRoomsByTemplate = async (templateId) => {
  const [rooms] = await db.query(`
    SELECT
      r.*,
      l.name as location_name,
      l.city as location_city,
      rr.price as base_price
    FROM rooms r
    LEFT JOIN locations l ON r.location_id = l.id
    LEFT JOIN room_rates rr ON r.id = rr.room_id AND rr.rate_type = 'base' AND rr.is_active = TRUE
    WHERE r.template_id = ?
    ORDER BY r.room_number
  `, [templateId]);

  // Parse JSON fields if they're strings (MySQL2 may auto-parse JSON columns)
  return rooms.map(room => ({
    ...room,
    amenities: typeof room.amenities === 'string' ? JSON.parse(room.amenities) : (room.amenities || []),
    images: typeof room.images === 'string' ? JSON.parse(room.images) : (room.images || []),
    policies: typeof room.policies === 'string' ? JSON.parse(room.policies) : (room.policies || {}),
    override_flags: typeof room.override_flags === 'string' ? JSON.parse(room.override_flags) : (room.override_flags || {})
  }));
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  syncTemplateToRooms,
  deleteTemplate,
  getRoomsByTemplate
};
