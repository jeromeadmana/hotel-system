const db = require('../config/db');

// Get all rooms with filters
const getRooms = async (req, res, next) => {
  try {
    const { location_id, room_type, status, min_occupancy } = req.query;

    let query = `
      SELECT r.*,
             l.name as location_name,
             (SELECT price FROM room_rates WHERE room_id = r.id AND rate_type = 'base' AND is_active = TRUE LIMIT 1) as base_price
      FROM rooms r
      LEFT JOIN locations l ON r.location_id = l.id
      WHERE r.is_active = TRUE AND r.is_public = TRUE
    `;

    const params = [];

    if (location_id) {
      query += ' AND r.location_id = ?';
      params.push(location_id);
    }

    if (room_type) {
      query += ' AND r.room_type = ?';
      params.push(room_type);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (min_occupancy) {
      query += ' AND r.max_occupancy >= ?';
      params.push(min_occupancy);
    }

    query += ' ORDER BY r.room_number';

    const [rooms] = await db.query(query, params);

    // Parse JSON fields
    const parsedRooms = rooms.map(room => ({
      ...room,
      amenities: room.amenities ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities) : [],
      images: room.images ? (typeof room.images === 'string' ? JSON.parse(room.images) : room.images) : []
    }));

    res.json({
      success: true,
      data: { rooms: parsedRooms }
    });
  } catch (error) {
    next(error);
  }
};

// Get room by ID
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rooms] = await db.query(`
      SELECT r.*,
             l.name as location_name,
             l.address as location_address,
             l.city as location_city
      FROM rooms r
      LEFT JOIN locations l ON r.location_id = l.id
      WHERE r.id = ? AND r.is_active = TRUE AND r.is_public = TRUE
    `, [id]);

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Get room rates
    const [rates] = await db.query(`
      SELECT * FROM room_rates
      WHERE room_id = ? AND is_active = TRUE
      ORDER BY rate_type
    `, [id]);

    // Parse JSON fields
    const room = rooms[0];
    room.amenities = room.amenities ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities) : [];
    room.images = room.images ? (typeof room.images === 'string' ? JSON.parse(room.images) : room.images) : [];

    res.json({
      success: true,
      data: {
        room,
        rates
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create room (admin/super_admin only)
const createRoom = async (req, res, next) => {
  try {
    const {
      location_id,
      room_number,
      room_type,
      floor_number,
      max_occupancy,
      bed_type,
      size_sqft,
      description,
      amenities
    } = req.body;

    // Check if room number already exists at location
    const [existing] = await db.query(
      'SELECT id FROM rooms WHERE location_id = ? AND room_number = ?',
      [location_id, room_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Room number already exists at this location'
      });
    }

    const [result] = await db.query(`
      INSERT INTO rooms (
        location_id, room_number, room_type, floor_number,
        max_occupancy, bed_type, size_sqft, description, amenities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      location_id, room_number, room_type, floor_number,
      max_occupancy, bed_type, size_sqft, description,
      JSON.stringify(amenities || [])
    ]);

    const [newRoom] = await db.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room: newRoom[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Update room
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      room_number,
      room_type,
      floor_number,
      max_occupancy,
      bed_type,
      size_sqft,
      description,
      amenities,
      status
    } = req.body;

    const updates = [];
    const params = [];

    if (room_number !== undefined) {
      updates.push('room_number = ?');
      params.push(room_number);
    }
    if (room_type !== undefined) {
      updates.push('room_type = ?');
      params.push(room_type);
    }
    if (floor_number !== undefined) {
      updates.push('floor_number = ?');
      params.push(floor_number);
    }
    if (max_occupancy !== undefined) {
      updates.push('max_occupancy = ?');
      params.push(max_occupancy);
    }
    if (bed_type !== undefined) {
      updates.push('bed_type = ?');
      params.push(bed_type);
    }
    if (size_sqft !== undefined) {
      updates.push('size_sqft = ?');
      params.push(size_sqft);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (amenities !== undefined) {
      updates.push('amenities = ?');
      params.push(JSON.stringify(amenities));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRoom] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room: updatedRoom[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Delete room (soft delete)
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE rooms SET is_active = FALSE WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update room status
const updateRoomStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: 'Room status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus
};
