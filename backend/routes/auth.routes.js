// backend/routes/auth.routes.js
const express = require('express');
const { register, login, getProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware'); // ← Bu satırı ekleyin

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes - middleware kullanımı
router.get('/profile', authenticateToken, getProfile); // ← Middleware burada kullanılıyor

module.exports = router;