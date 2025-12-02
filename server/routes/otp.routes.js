const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const config = require('../config/env');

const OTPIQ_API_KEY = process.env.OTPIQ_API_KEY;

// Debug logging for API key
console.log('=== OTP Routes Loaded ===');
console.log('OTPIQ_API_KEY exists:', !!OTPIQ_API_KEY);
console.log('OTPIQ_API_KEY length:', OTPIQ_API_KEY?.length || 0);

// Diagnostic endpoint to check OTPIQ configuration
// eslint-disable-next-line no-unused-vars
router.get('/debug-config', (req, res) => {
  res.json({
    otpiqKeyExists: !!OTPIQ_API_KEY,
    otpiqKeyLength: OTPIQ_API_KEY?.length || 0,
    otpiqKeyPrefix: OTPIQ_API_KEY?.substring(0, 10) + '...',
    nodeEnv: process.env.NODE_ENV,
  });
});

/**
 * Generate a random 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    // Already in correct format
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
 *     summary: Send OTP to phone number (only for NEW users)
 *     description: Checks if user exists. If exists, returns user info for direct login. If not, sends OTP for registration.
 *     tags: [OTP]
 */
router.post('/send', async (req, res) => {
  console.log('=== OTP Send Request ===');
  console.log('Request body:', req.body);

  try {
    let { phone } = req.body;
    console.log('Raw phone input:', phone);

    // Validate and format phone number
    phone = formatIraqiPhone(phone);
    console.log('Formatted phone:', phone);

    if (!phone) {
      console.log('Phone validation failed');
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف غير صحيح. يرجى إدخال رقم عراقي صحيح',
      });
    }

    // ============================================
    // CHECK IF USER EXISTS (skip OTP for existing users)
    // ============================================
    console.log('Checking if user exists...');
    const existingUser = await query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (existingUser.rows.length > 0) {
      // User exists - LOGIN DIRECTLY (NO OTP needed = NO COST!)
      const user = existingUser.rows[0];
      console.log('User exists, logging in directly (NO OTP sent):', user.id);

      // Generate JWT token directly
      const token = jwt.sign(
        { id: user.id, phone: phone },
        config.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        userExists: true,
        message: 'تم تسجيل الدخول بنجاح',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          phone: phone,
          email: user.email,
          isDriver: user.is_driver,
          role: user.role,
          phoneVerified: user.phone_verified,
        },
      });
    }

    console.log('New user, proceeding with OTP...');
    // ============================================

    // Check rate limiting (max 5 OTPs per phone per hour)
    console.log('Checking rate limiting...');
    const recentOTPs = await query(
      `SELECT COUNT(*) FROM otp_requests
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [phone]
    );
    console.log('Recent OTPs count:', recentOTPs.rows[0].count);

    if (parseInt(recentOTPs.rows[0].count) >= 5) {
      console.log('Rate limit exceeded');
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

    // Generate OTP code locally
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    console.log('Generated OTP code:', code);

    // Invalidate previous OTPs for this phone
    console.log('Invalidating previous OTPs...');
    await query(`UPDATE otp_requests SET verified = true WHERE phone = $1 AND verified = false`, [
      phone,
    ]);

    // Store OTP in database
    console.log('Storing OTP in database...');
    await query(
      `INSERT INTO otp_requests (phone, code, channel, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [phone, code, 'whatsapp', expiresAt]
    );
    console.log('OTP stored successfully');

    // Send OTP via OTPIQ (WhatsApp first, then SMS fallback)
    const phoneWithoutPlus = phone.replace('+', '');
    console.log('Phone for OTPIQ (without +):', phoneWithoutPlus);
    let channel = 'whatsapp';

    try {
      // Try WhatsApp first
      console.log('Sending OTP via OTPIQ WhatsApp...');
      console.log('OTPIQ Request payload:', {
        phoneNumber: phoneWithoutPlus,
        smsType: 'verification',
        verificationCode: code,
        provider: 'whatsapp-sms',
      });

      const whatsappResponse = await axios.post(
        'https://api.otpiq.com/api/sms',
        {
          phoneNumber: phoneWithoutPlus,
          smsType: 'verification',
          verificationCode: code,
          provider: 'whatsapp-sms',
        },
        {
          headers: {
            Authorization: `Bearer ${OTPIQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('OTPIQ WhatsApp Response:', whatsappResponse.data);
      console.log(`OTP ${code} sent to ${phone} via WhatsApp`);

      res.json({
        success: true,
        message: 'تم إرسال رمز التحقق عبر واتساب',
        channel: 'whatsapp',
      });
    } catch (whatsappError) {
      console.error('=== OTPIQ WhatsApp Error ===');
      console.error('Error Status:', whatsappError.response?.status);
      console.error('Error Data:', JSON.stringify(whatsappError.response?.data, null, 2));
      console.error('Error Message:', whatsappError.message);
      console.error('Error Code:', whatsappError.code);
      const whatsappErrorDetail = whatsappError.response?.data?.message || whatsappError.response?.data?.error || whatsappError.message;
      console.error('WhatsApp error detail:', whatsappErrorDetail);

      // Try SMS fallback
      console.log('WhatsApp failed, trying SMS fallback...');
      try {
        console.log('Sending OTP via OTPIQ SMS...');
        const smsResponse = await axios.post(
          'https://api.otpiq.com/api/sms',
          {
            phoneNumber: phoneWithoutPlus,
            smsType: 'verification',
            verificationCode: code,
            provider: 'sms',
          },
          {
            headers: {
              Authorization: `Bearer ${OTPIQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        console.log('OTPIQ SMS Response:', smsResponse.data);

        // Update channel in database
        await query(
          `UPDATE otp_requests SET channel = 'sms'
           WHERE phone = $1 AND code = $2`,
          [phone, code]
        );

        console.log(`OTP ${code} sent to ${phone} via SMS`);

        res.json({
          success: true,
          message: 'تم إرسال رمز التحقق عبر SMS',
          channel: 'sms',
        });
      } catch (smsError) {
        console.error('=== OTPIQ SMS Error ===');
        console.error('Error Status:', smsError.response?.status);
        console.error('Error Data:', JSON.stringify(smsError.response?.data, null, 2));
        console.error('Error Message:', smsError.message);
        console.error('Error Code:', smsError.code);

        // Delete the OTP record since we couldn't send it
        await query(`DELETE FROM otp_requests WHERE phone = $1 AND code = $2`, [phone, code]);

        // Get detailed error message from OTPIQ
        const otpiqErrorMsg = smsError.response?.data?.message || smsError.response?.data?.error || smsError.message;
        const statusCode = smsError.response?.status;

        let userErrorMsg = 'فشل في إرسال رمز التحقق. حاول مرة أخرى.';
        if (statusCode === 401) {
          userErrorMsg = 'خطأ في إعدادات خدمة التحقق. يرجى التواصل مع الدعم.';
        } else if (statusCode === 400) {
          userErrorMsg = 'رقم الهاتف غير صالح. تأكد من إدخال رقم عراقي صحيح.';
        } else if (statusCode === 402 || otpiqErrorMsg?.toLowerCase().includes('balance')) {
          userErrorMsg = 'خدمة التحقق غير متوفرة مؤقتاً. يرجى المحاولة لاحقاً.';
        }

        console.error('Final error message to user:', userErrorMsg);
        console.error('OTPIQ error details:', otpiqErrorMsg);

        res.status(500).json({
          success: false,
          error: userErrorMsg,
          debug: process.env.NODE_ENV === 'development' ? otpiqErrorMsg : undefined,
        });
      }
    }
  } catch (error) {
    console.error('=== OTP Send General Error ===');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في النظام. حاول مرة أخرى.',
    });
  }
});

/**
 * @swagger
 * /otp/verify:
 *   post:
 *     summary: Verify OTP code
 *     description: Verifies the 6-digit OTP code locally (in our database)
 *     tags: [OTP]
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

    // Verify code in our database (NOT via OTPIQ)
    const result = await query(
      `SELECT * FROM otp_requests
       WHERE phone = $1
       AND code = $2
       AND verified = false
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, code]
    );

    if (result.rows.length === 0) {
      // Increment attempts counter for rate limiting
      await query(
        `UPDATE otp_requests
         SET attempts = attempts + 1
         WHERE phone = $1 AND verified = false`,
        [phone]
      );

      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      });
    }

    // Mark OTP as verified
    await query(`UPDATE otp_requests SET verified = true WHERE id = $1`, [result.rows[0].id]);

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
    console.error('OTP Verify Error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في التحقق. حاول مرة أخرى.',
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
 * /otp/login-existing:
 *   post:
 *     summary: Direct login for existing users (no OTP required)
 *     description: Logs in an existing user directly without OTP verification
 *     tags: [OTP]
 */
router.post('/login-existing', async (req, res) => {
  console.log('=== Login Existing User Request ===');
  console.log('Request body:', req.body);

  try {
    let { phone } = req.body;

    // Validate and format phone number
    phone = formatIraqiPhone(phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف غير صحيح',
      });
    }

    // Find the user
    const userResult = await query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    const user = userResult.rows[0];

    // Generate JWT token
    const token = jwt.sign({ id: user.id, phone: phone }, config.JWT_SECRET, {
      expiresIn: '30d',
    });

    console.log('User logged in successfully:', user.id);

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        phone: phone,
        email: user.email,
        isDriver: user.is_driver,
        phoneVerified: user.phone_verified,
      },
    });
  } catch (error) {
    console.error('Login Existing User Error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في تسجيل الدخول. حاول مرة أخرى.',
    });
  }
});

module.exports = router;
