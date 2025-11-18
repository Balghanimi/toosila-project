/**
 * Email Verification Controller
 * Handles email verification, resend verification, and email change verification
 */

const crypto = require('crypto');
const { query } = require('../config/db');
const { sendVerificationEmail, sendEmailChangeVerification } = require('../utils/emailService');
const logger = require('../config/logger');

/**
 * Generate a secure verification token
 * @returns {string} - Hashed token to store in database
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token for storage (prevents token theft from database breach)
 * @param {string} token - Plain token
 * @returns {string} - Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Send verification email to user
 * Called after registration or resend verification
 */
const sendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مؤكد بالفعل'
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store hashed token in database
    await query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [hashedToken, expiresAt, user.id]
    );

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'تم إرسال رسالة التأكيد إلى بريدك الإلكتروني'
    });

  } catch (error) {
    logger.error('Send verification error', { error: error.message, email: req.body?.email });
    res.status(500).json({
      success: false,
      message: 'فشل في إرسال رسالة التأكيد'
    });
  }
};

/**
 * Verify email with token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'رمز التأكيد مطلوب'
      });
    }

    // Hash the provided token to match database
    const hashedToken = hashToken(token);

    // Find user with this token
    const userResult = await query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [hashedToken]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'رمز التأكيد غير صالح أو منتهي الصلاحية'
      });
    }

    const user = userResult.rows[0];

    // Update user as verified
    await query(
      `UPDATE users
       SET email_verified = true,
           email_verified_at = NOW(),
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    res.json({
      success: true,
      message: 'تم تأكيد بريدك الإلكتروني بنجاح!'
    });

  } catch (error) {
    logger.error('Email verification error', { error: error.message, token: req.params?.token });
    res.status(500).json({
      success: false,
      message: 'فشل في تأكيد البريد الإلكتروني'
    });
  }
};

/**
 * Resend verification email
 */
const resendVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مؤكد بالفعل'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update token in database
    await query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [hashedToken, expiresAt, user.id]
    );

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'تم إعادة إرسال رسالة التأكيد'
    });

  } catch (error) {
    logger.error('Resend verification error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'فشل في إعادة إرسال رسالة التأكيد'
    });
  }
};

/**
 * Check if user email is verified
 * Middleware function
 */
const requireEmailVerified = async (req, res, next) => {
  // TEMPORARY: Email verification disabled for testing
  // TODO: Re-enable after testing is complete
  logger.warn('Email verification check bypassed for testing', { userId: req.user?.id });
  return next();

  /* Original code - temporarily disabled
  try {
    const userId = req.user.id;

    const userResult = await query(
      'SELECT email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const user = userResult.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'يجب تأكيد بريدك الإلكتروني أولاً',
        requireVerification: true
      });
    }

    next();
  } catch (error) {
    logger.error('Email verification check error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من البريد الإلكتروني'
    });
  }
  */
};

module.exports = {
  sendVerification,
  verifyEmail,
  resendVerification,
  requireEmailVerified,
  generateVerificationToken,
  hashToken
};
