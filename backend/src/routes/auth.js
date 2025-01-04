const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', authenticateToken, authController.getCurrentUser);

// Update user profile (protected route)
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router; 