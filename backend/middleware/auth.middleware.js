// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authorization middleware implementation
 * Verifies JWT token and attaches user to request
 */
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
 
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
 
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};