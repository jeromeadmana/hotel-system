const db = require('../config/db');
const bookingService = require('../services/bookingService');

// Create a new booking (guest - no auth required)
const createGuestBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numGuests,
      specialRequests
    } = req.body;

    const booking = await bookingService.createBooking({
      roomId,
      userId: null,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numGuests,
      bookingType: 'guest',
      createdBy: null,
      specialRequests
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Create a new booking (registered user)
const createUserBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      numGuests,
      specialRequests
    } = req.body;

    const userId = req.user.id;

    const booking = await bookingService.createBooking({
      roomId,
      userId,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      checkInDate,
      checkOutDate,
      numGuests,
      bookingType: 'registered',
      createdBy: userId,
      specialRequests
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Staff-assisted booking
const createStaffAssistedBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numGuests,
      specialRequests
    } = req.body;

    const createdBy = req.user.id;

    const booking = await bookingService.createBooking({
      roomId,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numGuests,
      bookingType: 'staff_assisted',
      createdBy,
      specialRequests
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Super admin reserve (no guest info)
const createReservation = async (req, res, next) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      specialRequests
    } = req.body;

    const createdBy = req.user.id;

    const booking = await bookingService.createBooking({
      roomId,
      userId: null,
      guestName: 'Reserved',
      guestEmail: null,
      guestPhone: null,
      checkInDate,
      checkOutDate,
      numGuests: 0,
      bookingType: 'reserved',
      createdBy,
      specialRequests
    });

    res.status(201).json({
      success: true,
      message: 'Room reserved successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings with filters
const getBookings = async (req, res, next) => {
  try {
    const {
      status,
      payment_status,
      room_id,
      user_id,
      check_in_date,
      booking_type
    } = req.query;

    let query = `
      SELECT b.*,
             r.room_number,
             r.room_type,
             l.name as location_name,
             u.first_name as user_first_name,
             u.last_name as user_last_name,
             u.email as user_email
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN locations l ON r.location_id = l.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based filtering
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      // Staff and admin only see bookings for their location
      query += ` AND r.location_id = ?`;
      params.push(req.user.location_id);
    }

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (payment_status) {
      query += ' AND b.payment_status = ?';
      params.push(payment_status);
    }

    if (room_id) {
      query += ' AND b.room_id = ?';
      params.push(room_id);
    }

    if (user_id) {
      query += ' AND b.user_id = ?';
      params.push(user_id);
    }

    if (check_in_date) {
      query += ' AND b.check_in_date >= ?';
      params.push(check_in_date);
    }

    if (booking_type) {
      query += ' AND b.booking_type = ?';
      params.push(booking_type);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await db.query(query, params);

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query(`
      SELECT b.*,
             r.room_number,
             r.room_type,
             r.description as room_description,
             r.amenities,
             l.name as location_name,
             l.address as location_address,
             l.city as location_city,
             u.first_name as user_first_name,
             u.last_name as user_last_name,
             u.email as user_email,
             u.phone as user_phone
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN locations l ON r.location_id = l.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get payment history
    const [payments] = await db.query(`
      SELECT * FROM payments
      WHERE booking_id = ?
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        booking: bookings[0],
        payments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by reference (for guests)
const getBookingByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const [bookings] = await db.query(`
      SELECT b.*,
             r.room_number,
             r.room_type,
             r.description as room_description,
             l.name as location_name,
             l.address as location_address,
             l.city as location_city
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN locations l ON r.location_id = l.id
      WHERE b.booking_reference = ?
    `, [reference]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get payment history
    const [payments] = await db.query(`
      SELECT * FROM payments
      WHERE booking_id = ?
      ORDER BY created_at DESC
    `, [bookings[0].id]);

    res.json({
      success: true,
      data: {
        booking: bookings[0],
        payments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason } = req.body;

    const updates = { status };
    const params = [];

    if (status === 'cancelled' && cancellation_reason) {
      updates.cancellation_reason = cancellation_reason;
      updates.cancelled_at = new Date();
    }

    const setClause = Object.keys(updates).map(key => {
      params.push(updates[key]);
      return `${key} = ?`;
    }).join(', ');

    params.push(id);

    await db.query(`UPDATE bookings SET ${setClause} WHERE id = ?`, params);

    res.json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Check room availability
const checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.query;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'roomId, checkInDate, and checkOutDate are required'
      });
    }

    const isAvailable = await bookingService.checkRoomAvailability(roomId, checkInDate, checkOutDate);

    res.json({
      success: true,
      data: { isAvailable }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGuestBooking,
  createUserBooking,
  createStaffAssistedBooking,
  createReservation,
  getBookings,
  getBookingById,
  getBookingByReference,
  updateBookingStatus,
  checkAvailability
};
