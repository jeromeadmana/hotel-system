const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const roomTemplateController = require('../controllers/roomTemplateController');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validateRequest = require('../middleware/validateRequest');

// Validation rules
const createTemplateValidation = [
  body('location_id').notEmpty().withMessage('Location ID is required'),
  body('template_name').trim().notEmpty().withMessage('Template name is required'),
  body('public_name').trim().notEmpty().withMessage('Public name is required'),
  body('room_type').isIn(['single', 'double', 'suite', 'deluxe', 'family', 'executive', 'penthouse']).withMessage('Invalid room type'),
  body('max_occupancy').isInt({ min: 1 }).withMessage('Max occupancy must be at least 1'),
  body('description').optional().trim(),
  body('long_description').optional().trim(),
  body('bed_type').optional().trim(),
  body('size_sqft').optional().isInt({ min: 1 }).withMessage('Size must be positive'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('policies').optional().isObject().withMessage('Policies must be an object'),
  body('base_price').optional().isFloat({ min: 0 }).withMessage('Base price must be positive'),
  validateRequest
];

const updateTemplateValidation = [
  body('template_name').optional().trim().notEmpty(),
  body('public_name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('long_description').optional().trim(),
  body('max_occupancy').optional().isInt({ min: 1 }),
  body('bed_type').optional().trim(),
  body('size_sqft').optional().isInt({ min: 1 }),
  body('amenities').optional().isArray(),
  body('images').optional().isArray(),
  body('policies').optional().isObject(),
  body('base_price').optional().isFloat({ min: 0 }),
  body('is_active').optional().isBoolean(),
  validateRequest
];

// Routes - ALL ADMIN ONLY (super_admin or admin)

// Get all templates (filtered by location for admin)
router.get('/',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomTemplateController.getAllTemplates
);

// Get template by ID
router.get('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomTemplateController.getTemplateById
);

// Create new template
router.post('/',
  auth,
  roleCheck(['admin', 'super_admin']),
  createTemplateValidation,
  roomTemplateController.createTemplate
);

// Update template (use query param ?apply_to_rooms=true to sync to existing rooms)
router.put('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  updateTemplateValidation,
  roomTemplateController.updateTemplate
);

// Sync template changes to all linked rooms
router.post('/:id/sync',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomTemplateController.syncTemplateToRooms
);

// Delete template (only if no rooms are using it)
router.delete('/:id',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomTemplateController.deleteTemplate
);

// Get all rooms created from this template
router.get('/:id/rooms',
  auth,
  roleCheck(['admin', 'super_admin']),
  roomTemplateController.getRoomsByTemplate
);

module.exports = router;
