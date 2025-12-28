const roomTemplateService = require('../services/roomTemplateService');

/**
 * Get all room templates (admin-only)
 * Query params: location_id (optional)
 */
const getAllTemplates = async (req, res, next) => {
  try {
    const { location_id } = req.query;

    // If admin (not super_admin), filter by their location
    const locationFilter = req.user.role === 'admin' ? req.user.location_id : location_id;

    const templates = await roomTemplateService.getAllTemplates(locationFilter);

    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get template by ID
 */
const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await roomTemplateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Room template not found'
      });
    }

    // Check access: super_admin can see all, admin can only see their location
    if (req.user.role === 'admin' && template.location_id !== req.user.location_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this template'
      });
    }

    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new room template
 */
const createTemplate = async (req, res, next) => {
  try {
    const templateData = req.body;

    // If admin (not super_admin), force their location
    if (req.user.role === 'admin') {
      templateData.location_id = req.user.location_id;
    }

    // Validate location_id is provided
    if (!templateData.location_id) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required'
      });
    }

    // Get location code for template code generation
    const db = require('../config/db');
    const [locations] = await db.query('SELECT city FROM locations WHERE id = ?', [templateData.location_id]);

    if (locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }

    templateData.location_code = locations[0].city.substring(0, 3).toUpperCase();

    const template = await roomTemplateService.createTemplate(templateData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Room template created successfully',
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a room template
 * Query param: apply_to_rooms=true to sync changes to existing rooms
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { apply_to_rooms } = req.query;
    const templateData = req.body;

    // Check template exists and user has access
    const existingTemplate = await roomTemplateService.getTemplateById(id);

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Room template not found'
      });
    }

    // Check access: super_admin can update all, admin can only update their location
    if (req.user.role === 'admin' && existingTemplate.location_id !== req.user.location_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to update this template'
      });
    }

    const applyToRooms = apply_to_rooms === 'true';
    const template = await roomTemplateService.updateTemplate(id, templateData, applyToRooms);

    res.json({
      success: true,
      message: applyToRooms
        ? 'Template updated and changes synced to linked rooms'
        : 'Template updated successfully',
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync template changes to all linked rooms
 */
const syncTemplateToRooms = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check template exists and user has access
    const template = await roomTemplateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Room template not found'
      });
    }

    // Check access
    if (req.user.role === 'admin' && template.location_id !== req.user.location_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to sync this template'
      });
    }

    const updatedCount = await roomTemplateService.syncTemplateToRooms(id);

    res.json({
      success: true,
      message: `Template synced to ${updatedCount} room(s)`,
      data: { updated_rooms: updatedCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a room template
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check template exists and user has access
    const template = await roomTemplateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Room template not found'
      });
    }

    // Check access
    if (req.user.role === 'admin' && template.location_id !== req.user.location_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this template'
      });
    }

    await roomTemplateService.deleteTemplate(id);

    res.json({
      success: true,
      message: 'Room template deleted successfully'
    });
  } catch (error) {
    // Handle constraint error (rooms still using template)
    if (error.message.includes('Cannot delete template')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Get all rooms created from a specific template
 */
const getRoomsByTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check template exists and user has access
    const template = await roomTemplateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Room template not found'
      });
    }

    // Check access
    if (req.user.role === 'admin' && template.location_id !== req.user.location_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to view rooms for this template'
      });
    }

    const rooms = await roomTemplateService.getRoomsByTemplate(id);

    res.json({
      success: true,
      data: { rooms }
    });
  } catch (error) {
    next(error);
  }
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
