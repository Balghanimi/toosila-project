/**
 * Email Verification Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  sendVerification,
  verifyEmail,
  resendVerification
} = require('../controllers/emailVerification.controller');

// Send verification email (public - for new registrations)
router.post('/send', sendVerification);

// Verify email with token (public - accessed from email link)
router.get('/verify/:token', verifyEmail);

// Resend verification email (protected - user must be logged in)
router.post('/resend', authenticateToken, resendVerification);

module.exports = router;
