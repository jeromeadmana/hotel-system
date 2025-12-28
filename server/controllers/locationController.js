const db = require('../config/db');

// Get all locations
const getLocations = async (req, res, next) => {
  try {
    const [locations] = await db.query(`
      SELECT * FROM locations
      WHERE is_active = TRUE
      ORDER BY city
    `);

    res.json({
      success: true,
      data: { locations }
    });
  } catch (error) {
    next(error);
  }
};

// Get location by ID
const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [locations] = await db.query(`
      SELECT * FROM locations WHERE id = ?
    `, [id]);

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: { location: locations[0] }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getLocationById
};
