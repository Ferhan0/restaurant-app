// backend/routes/auth.routes.js
const express = require('express');
const { register, login, getProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { createAccountLimiter } = require('../middleware/security.middleware');
const { 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors 
} = require('../validators/auth.validator');

const router = express.Router();

// Validation ile routes
router.post('/register', 
  createAccountLimiter,
  validateRegistration, 
  handleValidationErrors, 
  register
);

router.post('/login', 
  validateLogin, 
  handleValidationErrors, 
  login
);

router.get('/profile', authenticateToken, getProfile);

module.exports = router;