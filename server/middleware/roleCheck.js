/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 * Must be used after auth middleware
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Location-based access control middleware
 * Ensures users can only access resources from their assigned location
 * Super admins bypass this check
 */
const locationCheck = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Super admins can access all locations
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Get location ID from request (could be in params, query, or body)
  const requestedLocationId =
    req.params.locationId ||
    req.query.locationId ||
    req.body.location_id;

  // If location is specified, verify it matches user's location
  if (requestedLocationId && parseInt(requestedLocationId) !== req.user.locationId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access resources from your location.'
    });
  }

  next();
};

module.exports = { roleCheck, locationCheck };
