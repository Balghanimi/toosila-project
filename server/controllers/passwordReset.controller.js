const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/users.model');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { query } = require('../config/db');
const logger = require('../config/logger');

/**
 * Generate a secure random token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token using SHA-256
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Request password reset - sends email with reset link
 * POST /api/password-reset/request
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'البريد الإلكتروني مطلوب / Email is required'
        }
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (!user) {
      return res.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور / If the email exists, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save hashed token to database
    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [hashedToken, expiresAt, user.id]
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
      logger.info('Password reset email sent successfully', { email, userId: user.id });
    } catch (emailError) {
      logger.error('Failed to send password reset email', { email, error: emailError.message });
      // Continue anyway - don't reveal email sending failure
    }

    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور / If the email exists, you will receive a password reset link'
    });

  } catch (error) {
    logger.error('Request password reset error', { error: error.message, email: req.body?.email });
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_REQUEST_FAILED',
        message: 'فشل في إرسال طلب إعادة التعيين / Failed to process reset request'
      }
    });
  }
};

/**
 * Verify reset token validity
 * GET /api/password-reset/verify/:token
 */
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'رمز التحقق مطلوب / Token is required'
        }
      });
    }

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find user with this token that hasn't expired
    const result = await query(
      `SELECT id, email, name, reset_password_expires
       FROM users
       WHERE reset_password_token = $1
       AND reset_password_expires > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'الرابط غير صالح أو منتهي الصلاحية / Link is invalid or expired'
        }
      });
    }

    res.json({
      success: true,
      message: 'الرابط صالح / Token is valid'
    });

  } catch (error) {
    logger.error('Verify reset token error', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_FAILED',
        message: 'فشل التحقق من الرابط / Failed to verify token'
      }
    });
  }
};

/**
 * Reset password with token
 * POST /api/password-reset/reset
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'جميع الحقول مطلوبة / All fields are required'
        }
      });
    }

    // Validate password length
    if (newPassword.length < 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_TOO_SHORT',
          message: 'كلمة المرور يجب أن تكون 5 أحرف على الأقل / Password must be at least 5 characters'
        }
      });
    }

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find user with this token that hasn't expired
    const result = await query(
      `SELECT id, email, name, reset_password_expires
       FROM users
       WHERE reset_password_token = $1
       AND reset_password_expires > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'الرابط غير صالح أو منتهي الصلاحية / Link is invalid or expired'
        }
      });
    }

    const user = result.rows[0];

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await query(
      `UPDATE users
       SET password_hash = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE id = $2`,
      [newPasswordHash, user.id]
    );

    logger.info('Password reset successful', { email: user.email, userId: user.id });

    res.json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح / Password reset successful'
    });

  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_FAILED',
        message: 'فشل في إعادة تعيين كلمة المرور / Failed to reset password'
      }
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
};
