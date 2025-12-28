const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const roomRateController = require('../controllers/roomRateController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

// Validation rules
const createRateValidation = [
  body('room_id').isInt().withMessage('Room ID is required'),
  body('rate_type').isIn(['base', 'weekend', 'seasonal', 'special']).withMessage('Invalid rate type'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  validateRequest
];

const updateRateValidation = [
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  body('is_active').optional().isBoolean(),
  validateRequest
];

const calculatePriceValidation = [
  query('room_id').isInt().withMessage('Room ID is required'),
  query('check_in').isISO8601().withMessage('Invalid check-in date'),
  query('check_out').isISO8601().withMessage('Invalid check-out date'),
  validateRequest
];

// Routes
router.get('/room/:roomId', roomRateController.getRoomRates); // Public

router.get('/calculate',
  calculatePriceValidation,
  roomRateController.calculatePrice
); // Public

router.post('/',
  auth,
  roleCheck(['admin', 'super_admin']),
  createRateValidation,
  roomRateController.createRoomRate
);

router.put('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  updateRateValidation,
  roomRateController.updateRoomRate
);

router.delete('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomRateController.deleteRoomRate
);

module.exports = router;
