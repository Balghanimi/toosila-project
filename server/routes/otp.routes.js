const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const config = require('../config/env');

const OTPIQ_API_KEY = process.env.OTPIQ_API_KEY;
const OTPIQ_BASE_URL = 'https://api.otpiq.com/api/v1';

/**
 * Helper function to format Iraqi phone numbers
 * Accepts: 07XXXXXXXXX, 7XXXXXXXXX, +9647XXXXXXXXX, 009647XXXXXXXXX
 * Returns: +9647XXXXXXXXX or null if invalid
 */
function formatIraqiPhone(phone) {
  if (!phone) return null;

  // Remove all non-digits except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle different formats
  if (cleaned.startsWith('+964')) {
    // Already in correct format, just clean it
    cleaned = cleaned;
  } else if (cleaned.startsWith('964')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('07')) {
    cleaned = '+964' + cleaned.substring(1);
  } else if (cleaned.startsWith('7')) {
    cleaned = '+964' + cleaned;
  } else if (cleaned.startsWith('00964')) {
    cleaned = '+' + cleaned.substring(2);
  } else {
    return null;
  }

  // Validate Iraqi mobile number format
  // Iraqi mobile numbers: +9647[3-9]XXXXXXXX (10 digits after country code)
  const iraqiMobileRegex = /^\+9647[3-9]\d{8}$/;
  if (!iraqiMobileRegex.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * @swagger
 * /otp/send:
 *   post:
 *     summary: Send OTP to phone number
 *     description: Sends a 6-digit OTP code via WhatsApp (primary) or SMS (fallback)
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Iraqi phone number (07X XXXX XXXX format)
 *                 example: "07812345678"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Failed to send OTP
 */
router.post('/send', async (req, res) => {
  try {
    let { phone } = req.body;

    // Validate and format phone number
    phone = formatIraqiPhone(phone);
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف غير صحيح. يرجى إدخال رقم عراقي صحيح',
      });
    }

    // Check rate limiting (max 3 OTPs per phone per hour)
    const recentOTPs = await query(
      `SELECT COUNT(*) FROM otp_requests
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [phone]
    );

    if (parseInt(recentOTPs.rows[0].count) >= 3) {
      return res.status(429).json({
        success: false,
        error: 'تم تجاوز الحد المسموح. حاول بعد ساعة.',
      });
    }

    // Check if OTPIQ API key is configured
    if (!OTPIQ_API_KEY) {
      console.error('OTPIQ_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'خدمة التحقق غير متوفرة حالياً',
      });
    }

    // Send OTP via OTPIQ (WhatsApp first, then SMS fallback)
    let channel = 'whatsapp';
    let response;

    try {
      response = await axios.post(
        `${OTPIQ_BASE_URL}/send`,
        {
          phone: phone,
          channel: 'whatsapp',
          projectId: 'toosila',
        },
        {
          headers: {
            Authorization: `Bearer ${OTPIQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );
    } catch (whatsappError) {
      console.log('WhatsApp OTP failed, trying SMS:', whatsappError.message);

      // Fallback to SMS if WhatsApp fails
      channel = 'sms';
      try {
        response = await axios.post(
          `${OTPIQ_BASE_URL}/send`,
          {
            phone: phone,
            channel: 'sms',
            projectId: 'toosila',
          },
          {
            headers: {
              Authorization: `Bearer ${OTPIQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );
      } catch (smsError) {
        console.error('SMS OTP also failed:', smsError.message);
        throw smsError;
      }
    }

    // Store OTP request in database for tracking
    await query(
      `INSERT INTO otp_requests (phone, channel, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [phone, channel]
    );

    res.json({
      success: true,
      message: channel === 'whatsapp' ? 'تم إرسال الرمز عبر واتساب' : 'تم إرسال الرمز عبر SMS',
      channel: channel,
    });
  } catch (error) {
    console.error('OTP Send Error:', error.response?.data || error.message);

    // Handle specific OTPIQ errors
    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'خطأ في إعدادات الخدمة',
      });
    }

    res.status(500).json({
      success: false,
      error: 'فشل في إرسال رمز التحقق. حاول مرة أخرى.',
    });
  }
});

/**
 * @swagger
 * /otp/verify:
 *   post:
 *     summary: Verify OTP code
 *     description: Verifies the 6-digit OTP code and returns user data or indicates new user
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "07812345678"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Verification failed
 */
router.post('/verify', async (req, res) => {
  try {
    let { phone, code } = req.body;

    phone = formatIraqiPhone(phone);
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: 'البيانات غير مكتملة',
      });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق يجب أن يكون 6 أرقام',
      });
    }

    // Check if OTPIQ API key is configured
    if (!OTPIQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'خدمة التحقق غير متوفرة حالياً',
      });
    }

    // Verify with OTPIQ
    let verifyResponse;
    try {
      verifyResponse = await axios.post(
        `${OTPIQ_BASE_URL}/verify`,
        {
          phone: phone,
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${OTPIQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
    } catch (verifyError) {
      console.error('OTPIQ verify error:', verifyError.response?.data || verifyError.message);

      if (verifyError.response?.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
        });
      }

      throw verifyError;
    }

    // Check if verification was successful
    if (!verifyResponse.data.success && !verifyResponse.data.verified) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح',
      });
    }

    // Mark OTP as verified in our database
    await query(
      `UPDATE otp_requests
       SET verified = true
       WHERE phone = $1 AND verified = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    // Check if user exists
    const userResult = await query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (userResult.rows.length > 0) {
      // Existing user - login
      const user = userResult.rows[0];

      // Generate JWT token
      const token = jwt.sign({ id: user.id, phone: phone }, config.JWT_SECRET, {
        expiresIn: '30d',
      });

      // Update phone_verified status
      await query(
        `UPDATE users SET phone_verified = true, phone_verified_at = NOW()
         WHERE phone = $1`,
        [phone]
      );

      return res.json({
        success: true,
        isNewUser: false,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          phone: phone,
          email: user.email,
          isDriver: user.is_driver,
          phoneVerified: true,
        },
      });
    } else {
      // New user - needs to complete profile
      return res.json({
        success: true,
        isNewUser: true,
        phone: phone,
      });
    }
  } catch (error) {
    console.error('OTP Verify Error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: 'فشل في التحقق. حاول مرة أخرى.',
    });
  }
});

/**
 * @swagger
 * /otp/complete-registration:
 *   post:
 *     summary: Complete registration for new users
 *     description: Creates a new user account after phone verification
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - name
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "07812345678"
 *               name:
 *                 type: string
 *                 example: "أحمد محمد"
 *               is_driver:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Registration completed successfully
 *       400:
 *         description: Invalid data or phone already registered
 *       500:
 *         description: Registration failed
 */
router.post('/complete-registration', async (req, res) => {
  try {
    let { phone, name, is_driver } = req.body;

    phone = formatIraqiPhone(phone);
    if (!phone || !name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'البيانات غير مكتملة. يرجى إدخال الاسم ورقم الهاتف.',
      });
    }

    // Verify that this phone was recently verified (within last 10 minutes)
    const verifiedOTP = await query(
      `SELECT * FROM otp_requests
       WHERE phone = $1 AND verified = true
       AND created_at > NOW() - INTERVAL '10 minutes'
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    if (verifiedOTP.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'يرجى التحقق من رقم الهاتف أولاً',
      });
    }

    // Check if phone is already registered
    const existingUser = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف مسجل مسبقاً',
      });
    }

    // Create new user
    const result = await query(
      `INSERT INTO users (name, phone, phone_verified, phone_verified_at, is_driver, role, language_preference)
       VALUES ($1, $2, true, NOW(), $3, 'user', 'ar')
       RETURNING id, name, phone, is_driver, role, created_at`,
      [name.trim(), phone, is_driver || false]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ id: user.id, phone: phone }, config.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        isDriver: user.is_driver,
        phoneVerified: true,
      },
    });
  } catch (error) {
    console.error('Complete Registration Error:', error);

    if (error.code === '23505') {
      // Unique violation (PostgreSQL)
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف مسجل مسبقاً',
      });
    }

    res.status(500).json({
      success: false,
      error: 'فشل في إكمال التسجيل. حاول مرة أخرى.',
    });
  }
});

/**
 * @swagger
 * /otp/resend:
 *   post:
 *     summary: Resend OTP code
 *     description: Resends OTP code to the same phone number
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "07812345678"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/resend', async (req, res) => {
  // This is essentially the same as /send, but can have different rate limiting if needed
  // For now, just forward to /send logic
  return router.handle(req, res, () => {
    req.url = '/send';
    router.handle(req, res);
  });
});

module.exports = router;
