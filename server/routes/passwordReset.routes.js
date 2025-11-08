const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} = require('../controllers/passwordReset.controller');

// Request password reset (public - anyone can request)
// POST /api/password-reset/request
// Body: { email: string }
router.post('/request', requestPasswordReset);

// Verify reset token validity (public - checks if token is valid)
// GET /api/password-reset/verify/:token
router.get('/verify/:token', verifyResetToken);

// Reset password with token (public - uses token for auth)
// POST /api/password-reset/reset
// Body: { token: string, newPassword: string }
router.post('/reset', resetPassword);

module.exports = router;
