const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Validation middleware
const createGuestBookingValidation = [
  body('roomId').isInt().withMessage('Room ID must be a valid integer'),
  body('guestName').notEmpty().trim().withMessage('Guest name is required'),
  body('guestEmail').isEmail().withMessage('Valid email is required'),
  body('guestPhone').notEmpty().trim().withMessage('Phone number is required'),
  body('checkInDate').isDate().withMessage('Check-in date must be a valid date'),
  body('checkOutDate').isDate().withMessage('Check-out date must be a valid date'),
  body('numGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
];

const createUserBookingValidation = [
  body('roomId').isInt().withMessage('Room ID must be a valid integer'),
  body('checkInDate').isDate().withMessage('Check-in date must be a valid date'),
  body('checkOutDate').isDate().withMessage('Check-out date must be a valid date'),
  body('numGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
];

const createStaffBookingValidation = [
  body('roomId').isInt().withMessage('Room ID must be a valid integer'),
  body('checkInDate').isDate().withMessage('Check-in date must be a valid date'),
  body('checkOutDate').isDate().withMessage('Check-out date must be a valid date'),
  body('numGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
    .withMessage('Invalid status'),
];

// Public routes
router.post('/guest', createGuestBookingValidation, bookingController.createGuestBooking);
router.get('/reference/:reference', bookingController.getBookingByReference);
router.get('/check-availability', bookingController.checkAvailability);

// Protected routes - registered users
router.post('/user', auth, createUserBookingValidation, bookingController.createUserBooking);
router.get('/my-bookings', auth, async (req, res, next) => {
  req.query.user_id = req.user.id;
  bookingController.getBookings(req, res, next);
});

// Protected routes - staff
router.get('/', auth, roleCheck(['staff', 'admin', 'super_admin']), bookingController.getBookings);
router.get('/:id', auth, roleCheck(['staff', 'admin', 'super_admin']), bookingController.getBookingById);
router.post(
  '/staff-assisted',
  auth,
  roleCheck(['staff', 'admin', 'super_admin']),
  createStaffBookingValidation,
  bookingController.createStaffAssistedBooking
);
router.patch(
  '/:id/status',
  auth,
  roleCheck(['staff', 'admin', 'super_admin']),
  updateStatusValidation,
  bookingController.updateBookingStatus
);

// Protected routes - super admin only
router.post(
  '/reserve',
  auth,
  roleCheck(['super_admin']),
  bookingController.createReservation
);

module.exports = router;
