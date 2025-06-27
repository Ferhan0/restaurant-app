// backend/validators/auth.validator.js
const { body, validationResult } = require('express-validator');

// Input Validation - Registration
const validateRegistration = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters')
    .trim(),
    
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters')
    .trim(),
    
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password min 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['customer', 'staff', 'admin'])
    .withMessage('Invalid role specified')
];

// Input Validation - Login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Input Validation - Profile Update
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters')
    .trim(),
    
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters')
    .trim(),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
];

// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  handleValidationErrors
};