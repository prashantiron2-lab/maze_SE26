const express = require('express');
const { signup, verifyEmail, getProfile } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/profile', authenticate, getProfile);

module.exports = router;
