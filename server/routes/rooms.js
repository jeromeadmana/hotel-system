const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

// Validation rules
const createRoomValidation = [
  body('location_id').isInt().withMessage('Location ID is required'),
  body('room_number').trim().notEmpty().withMessage('Room number is required'),
  body('room_type').isIn(['single', 'double', 'suite', 'deluxe', 'family', 'executive']).withMessage('Invalid room type'),
  body('max_occupancy').isInt({ min: 1 }).withMessage('Max occupancy must be at least 1'),
  body('floor_number').optional().isInt().withMessage('Floor number must be an integer'),
  body('bed_type').optional().trim(),
  body('size_sqft').optional().isInt({ min: 1 }).withMessage('Size must be positive'),
  body('description').optional().trim(),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  validateRequest
];

const updateRoomValidation = [
  body('room_number').optional().trim().notEmpty(),
  body('room_type').optional().isIn(['single', 'double', 'suite', 'deluxe', 'family', 'executive']),
  body('max_occupancy').optional().isInt({ min: 1 }),
  body('floor_number').optional().isInt(),
  body('bed_type').optional().trim(),
  body('size_sqft').optional().isInt({ min: 1 }),
  body('description').optional().trim(),
  body('amenities').optional().isArray(),
  body('status').optional().isIn(['available', 'occupied', 'maintenance', 'cleaning', 'reserved']),
  validateRequest
];

const updateStatusValidation = [
  body('status').isIn(['available', 'occupied', 'maintenance', 'cleaning', 'reserved']).withMessage('Invalid status'),
  validateRequest
];

// Routes
router.get('/', roomController.getRooms); // Public - anyone can view rooms
router.get('/:id', roomController.getRoomById); // Public - anyone can view room details

router.post('/',
  auth,
  roleCheck(['admin', 'super_admin']),
  createRoomValidation,
  roomController.createRoom
);

router.put('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  updateRoomValidation,
  roomController.updateRoom
);

router.delete('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomController.deleteRoom
);

router.patch('/:id/status',
  auth,
  roleCheck(['staff', 'admin', 'super_admin']),
  updateStatusValidation,
  roomController.updateRoomStatus
);

module.exports = router;
