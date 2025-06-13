const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (we'll add authentication middleware later)
router.get('/profile', authController.getProfile);

module.exports = router;