const db = require('../config/db');
const { generateBookingReference } = require('../utils/bookingReference');

/**
 * Check if a room is available for the given date range
 */
const checkRoomAvailability = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  let query = `
    SELECT COUNT(*) as count
    FROM bookings
    WHERE room_id = ?
      AND status NOT IN ('cancelled', 'checked_out')
      AND (
        (check_in_date <= ? AND check_out_date > ?)
        OR (check_in_date < ? AND check_out_date >= ?)
        OR (check_in_date >= ? AND check_out_date <= ?)
      )
  `;

  const params = [roomId, checkInDate, checkInDate, checkOutDate, checkOutDate, checkInDate, checkOutDate];

  if (excludeBookingId) {
    query += ' AND id != ?';
    params.push(excludeBookingId);
  }

  const [rows] = await db.query(query, params);
  return rows[0].count === 0;
};

/**
 * Calculate the number of nights for a booking
 */
const calculateNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate booking price based on room rate and date range
 */
const calculateBookingPrice = async (roomId, checkInDate, checkOutDate) => {
  // Get base rate for the room
  const [rates] = await db.query(`
    SELECT price
    FROM room_rates
    WHERE room_id = ?
      AND rate_type = 'base'
      AND is_active = TRUE
    LIMIT 1
  `, [roomId]);

  if (rates.length === 0) {
    throw new Error('Room rate not found');
  }

  const basePrice = parseFloat(rates[0].price);
  const nights = calculateNights(checkInDate, checkOutDate);
  const totalAmount = basePrice * nights;

  return {
    basePrice,
    nights,
    totalAmount
  };
};

/**
 * Calculate downpayment based on booking type
 * Guest: 50%, Registered: 20%, Staff-assisted/Reserved: configurable
 */
const calculateDownpayment = (totalAmount, bookingType) => {
  const GUEST_DOWNPAYMENT_PERCENTAGE = 50;
  const REGISTERED_DOWNPAYMENT_PERCENTAGE = 20;

  let percentage = 0;

  switch (bookingType) {
    case 'guest':
      percentage = GUEST_DOWNPAYMENT_PERCENTAGE;
      break;
    case 'registered':
      percentage = REGISTERED_DOWNPAYMENT_PERCENTAGE;
      break;
    case 'staff_assisted':
      percentage = REGISTERED_DOWNPAYMENT_PERCENTAGE;
      break;
    case 'reserved':
      percentage = 0; // No payment for reserved bookings
      break;
    default:
      percentage = 50;
  }

  const downpaymentAmount = (totalAmount * percentage) / 100;
  const balanceAmount = totalAmount - downpaymentAmount;

  return {
    downpaymentAmount,
    balanceAmount,
    downpaymentPercentage: percentage
  };
};

/**
 * Check if booking is cross-location and calculate fee
 */
const calculateCrossLocationFee = async (roomId, userId) => {
  if (!userId) return 0; // Guest bookings have no cross-location fee

  // Get user's location
  const [users] = await db.query('SELECT location_id FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return 0;

  const userLocationId = users[0].location_id;

  // Get room's location
  const [rooms] = await db.query('SELECT location_id FROM rooms WHERE id = ?', [roomId]);
  if (rooms.length === 0) return 0;

  const roomLocationId = rooms[0].location_id;

  // If locations differ, add cross-location fee
  if (userLocationId !== roomLocationId) {
    return parseFloat(process.env.CROSS_LOCATION_FEE || 25.00);
  }

  return 0;
};

/**
 * Create a new booking
 */
const createBooking = async (bookingData) => {
  const {
    roomId,
    userId,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate,
    checkOutDate,
    numGuests,
    bookingType,
    createdBy,
    specialRequests
  } = bookingData;

  // Check room availability
  const isAvailable = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
  if (!isAvailable) {
    throw new Error('Room is not available for the selected dates');
  }

  // Calculate pricing
  const { totalAmount } = await calculateBookingPrice(roomId, checkInDate, checkOutDate);
  const crossLocationFee = await calculateCrossLocationFee(roomId, userId);
  const finalTotalAmount = totalAmount + crossLocationFee;
  const { downpaymentAmount, balanceAmount, downpaymentPercentage } = calculateDownpayment(finalTotalAmount, bookingType);

  // Generate booking reference
  let bookingReference;
  let isUnique = false;
  while (!isUnique) {
    bookingReference = generateBookingReference();
    const [existing] = await db.query('SELECT id FROM bookings WHERE booking_reference = ?', [bookingReference]);
    if (existing.length === 0) {
      isUnique = true;
    }
  }

  // Insert booking
  const [result] = await db.query(`
    INSERT INTO bookings (
      booking_reference,
      room_id,
      user_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      num_guests,
      total_amount,
      downpayment_amount,
      downpayment_percentage,
      balance_amount,
      cross_location_fee,
      status,
      payment_status,
      booking_type,
      created_by,
      special_requests
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?)
  `, [
    bookingReference,
    roomId,
    userId,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate,
    checkOutDate,
    numGuests,
    finalTotalAmount,
    downpaymentAmount,
    downpaymentPercentage,
    balanceAmount,
    crossLocationFee,
    bookingType,
    createdBy,
    specialRequests
  ]);

  return {
    bookingId: result.insertId,
    bookingReference,
    totalAmount: finalTotalAmount,
    downpaymentAmount,
    balanceAmount,
    crossLocationFee
  };
};

module.exports = {
  checkRoomAvailability,
  calculateNights,
  calculateBookingPrice,
  calculateDownpayment,
  calculateCrossLocationFee,
  createBooking
};
