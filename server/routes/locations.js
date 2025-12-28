const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public routes - anyone can view locations
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);

module.exports = router;
