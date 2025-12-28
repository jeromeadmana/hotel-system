const db = require('../config/db');

// Get rates for a room
const getRoomRates = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const [rates] = await db.query(`
      SELECT rr.*, u.first_name, u.last_name
      FROM room_rates rr
      LEFT JOIN users u ON rr.created_by = u.id
      WHERE rr.room_id = ? AND rr.is_active = TRUE
      ORDER BY rr.rate_type, rr.created_at DESC
    `, [roomId]);

    res.json({
      success: true,
      data: { rates }
    });
  } catch (error) {
    next(error);
  }
};

// Create room rate
const createRoomRate = async (req, res, next) => {
  try {
    const { room_id, rate_type, price, start_date, end_date } = req.body;
    const created_by = req.user.userId;

    const [result] = await db.query(`
      INSERT INTO room_rates (room_id, rate_type, price, start_date, end_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [room_id, rate_type, price, start_date, end_date, created_by]);

    const [newRate] = await db.query('SELECT * FROM room_rates WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Room rate created successfully',
      data: { rate: newRate[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Update room rate
const updateRoomRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, start_date, end_date, is_active } = req.body;

    const updates = [];
    const params = [];

    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(end_date);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE room_rates SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRate] = await db.query('SELECT * FROM room_rates WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Room rate updated successfully',
      data: { rate: updatedRate[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Delete room rate
const deleteRoomRate = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE room_rates SET is_active = FALSE WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Room rate deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Calculate price for date range
const calculatePrice = async (req, res, next) => {
  try {
    const { room_id, check_in, check_out } = req.query;

    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: 'room_id, check_in, and check_out are required'
      });
    }

    // Get base rate
    const [baseRate] = await db.query(`
      SELECT price FROM room_rates
      WHERE room_id = ? AND rate_type = 'base' AND is_active = TRUE
      LIMIT 1
    `, [room_id]);

    if (baseRate.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No rate found for this room'
      });
    }

    // Calculate number of nights
    const checkIn = new Date(check_in);
    const checkOut = new Date(check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const pricePerNight = parseFloat(baseRate[0].price);
    const totalPrice = pricePerNight * nights;

    res.json({
      success: true,
      data: {
        room_id: parseInt(room_id),
        check_in,
        check_out,
        nights,
        price_per_night: pricePerNight,
        total_price: totalPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomRates,
  createRoomRate,
  updateRoomRate,
  deleteRoomRate,
  calculatePrice
};
