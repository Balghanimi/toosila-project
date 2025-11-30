/**
 * Email Service for Toosila
 * Handles sending emails for verification, password reset, notifications, etc.
 *
 * Supports multiple providers (in priority order):
 * 1. Resend HTTP API (recommended - simple, reliable)
 * 2. SendGrid HTTP API (recommended for cloud platforms like Railway)
 * 3. Gmail SMTP
 * 4. Mailgun
 * 5. Any SMTP server
 *
 * IMPORTANT: Railway and many cloud providers BLOCK SMTP ports (25, 587, 465).
 * Use Resend or SendGrid HTTP API instead.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

// Email provider mode
let emailProvider = 'none';
let transporter = null;
let resendClient = null;

/**
 * Send email using Resend HTTP API (simple, reliable)
 * @param {object} mailOptions - Email options (from, to, subject, html)
 * @returns {Promise<object>} - Send result
 */
const sendViaResend = async (mailOptions) => {
  if (!resendClient) {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  const result = await resendClient.emails.send({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  });

  if (result.error) {
    throw new Error(result.error.message || 'Resend API error');
  }

  return {
    messageId: result.data?.id || 'resend-' + Date.now(),
    response: 'sent'
  };
};

/**
 * Send email using SendGrid HTTP API (bypasses SMTP port blocking)
 * @param {object} mailOptions - Email options (from, to, subject, html)
 * @returns {Promise<object>} - Send result
 */
const sendViaSendGridAPI = async (mailOptions) => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: mailOptions.to,
    from: mailOptions.from,
    subject: mailOptions.subject,
    html: mailOptions.html,
  };

  const result = await sgMail.send(msg);
  return {
    messageId: result[0]?.headers?.['x-message-id'] || 'sendgrid-' + Date.now(),
    response: result[0]?.statusCode
  };
};

/**
 * Send email using nodemailer transporter (SMTP)
 * @param {object} mailOptions - Email options
 * @returns {Promise<object>} - Send result
 */
const sendViaNodemailer = async (mailOptions) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }
  return await transporter.sendMail(mailOptions);
};

/**
 * Generic email send function that uses the best available method
 * @param {object} mailOptions - Email options
 * @returns {Promise<object>} - Send result
 */
const sendEmail = async (mailOptions) => {
  if (emailProvider === 'resend') {
    return await sendViaResend(mailOptions);
  } else if (emailProvider === 'sendgrid-api') {
    return await sendViaSendGridAPI(mailOptions);
  } else if (emailProvider === 'smtp' && transporter) {
    return await sendViaNodemailer(mailOptions);
  } else {
    throw new Error('No email provider configured');
  }
};

const initializeTransporter = () => {
  // Priority 1: Resend HTTP API (simple, reliable, works everywhere)
  if (process.env.RESEND_API_KEY) {
    emailProvider = 'resend';
    console.log('✅ Email service initialized with Resend HTTP API');
    return;
  }

  // Priority 2: SendGrid HTTP API (works on Railway and other cloud platforms)
  if (process.env.SENDGRID_API_KEY) {
    emailProvider = 'sendgrid-api';
    console.log('✅ Email service initialized with SendGrid HTTP API');
    return;
  }

  // Priority 3: SMTP (may be blocked on cloud platforms)
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    // Mailgun SMTP configuration
    transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY
      }
    });
    emailProvider = 'smtp';
  } else if (config.EMAIL_USER && config.EMAIL_PASS) {
    // Generic SMTP configuration (Gmail, etc.)
    // WARNING: May not work on Railway due to port blocking
    transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
    emailProvider = 'smtp';
  }
};

// Initialize email service
try {
  initializeTransporter();

  // Log email configuration on startup
  const emailConfig = {
    provider: emailProvider,
    resend: process.env.RESEND_API_KEY ? 'SET (HTTP API)' : 'NOT SET',
    sendgrid: process.env.SENDGRID_API_KEY ? 'SET (HTTP API)' : 'NOT SET',
    mailgun: process.env.MAILGUN_API_KEY ? 'SET' : 'NOT SET',
    smtp: config.EMAIL_USER ? `${config.EMAIL_HOST}:${config.EMAIL_PORT}` : 'NOT SET',
    from: config.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL
  };

  console.log('📧 Email Configuration:', JSON.stringify(emailConfig, null, 2));

  if (emailProvider === 'none') {
    console.warn('⚠️ EMAIL SERVICE NOT CONFIGURED - No email credentials found!');
    console.warn('   RECOMMENDED: Set RESEND_API_KEY (simple, reliable)');
    console.warn('   Alternative: Set SENDGRID_API_KEY for Railway/cloud platforms');
    console.warn('   Last resort: Set EMAIL_USER+EMAIL_PASS for SMTP (may be blocked)');
  } else if (emailProvider === 'smtp' && transporter) {
    // Verify SMTP connection (only for SMTP mode)
    console.log('🔄 Testing SMTP connection...');
    transporter.verify()
      .then(() => console.log('✅ SMTP connection verified successfully!'))
      .catch(err => {
        console.error('❌ SMTP connection failed:', err.message);
        console.warn('   ⚠️ SMTP ports may be blocked. Consider using SendGrid HTTP API instead.');
      });
  }
} catch (error) {
  console.error('❌ Failed to initialize email service:', error);
}

/**
 * Send verification email to new user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<object>} - Email send result
 */
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${config.FRONTEND_URL}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"توصيلة Toosila" <${config.EMAIL_FROM}>`,
    to: email,
    subject: 'تأكيد البريد الإلكتروني - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background-color: #45a049; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .en { direction: ltr; text-align: left; margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>مرحباً بك في توصيلة!</h1>
            <p>Welcome to Toosila!</p>
          </div>
          <div class="content">
            <h2>مرحباً ${name}،</h2>
            <p>شكراً لتسجيلك في توصيلة، منصة مشاركة الرحلات في العراق.</p>
            <p>لإكمال تسجيلك، يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه:</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
            </div>

            <p>أو انسخ الرابط التالي والصقه في متصفحك:</p>
            <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">
              ${verificationUrl}
            </p>

            <p><strong>ملاحظة:</strong> هذا الرابط صالح لمدة 24 ساعة فقط.</p>

            <p>إذا لم تقم بإنشاء حساب على توصيلة، يمكنك تجاهل هذه الرسالة.</p>

            <div class="en">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with Toosila, Iraq's ride-sharing platform.</p>
              <p>To complete your registration, please verify your email address by clicking the button above.</p>
              <p><strong>Note:</strong> This link is valid for 24 hours only.</p>
              <p>If you didn't create an account with Toosila, you can safely ignore this email.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 توصيلة Toosila. جميع الحقوق محفوظة.</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📧 Sending verification email...', {
      to: email,
      from: config.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL,
      provider: emailProvider,
      verificationUrl: verificationUrl
    });
    const info = await sendEmail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId, 'to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', {
      to: email,
      provider: emailProvider,
      message: error.message,
      code: error.code,
      response: error.response?.body || error.response
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<object>} - Email send result
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"توصيلة Toosila" <${config.EMAIL_FROM}>`,
    to: email,
    subject: 'إعادة تعيين كلمة المرور - Reset Password',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { background-color: white; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 20px 0; }
          .en { direction: ltr; text-align: left; margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>إعادة تعيين كلمة المرور</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${name}،</h2>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك على توصيلة.</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
            </div>

            <p>أو انسخ الرابط التالي:</p>
            <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>

            <div class="warning">
              <strong>⚠️ تنبيه أمني:</strong>
              <ul>
                <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة</li>
                <li>لا تشارك هذا الرابط مع أي شخص</li>
              </ul>
            </div>

            <div class="en">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your Toosila account.</p>
              <p><strong>Security Alert:</strong></p>
              <ul>
                <li>This link is valid for 1 hour only</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Don't share this link with anyone</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await sendEmail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send email change verification email
 * @param {string} newEmail - New email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<object>} - Email send result
 */
const sendEmailChangeVerification = async (newEmail, name, verificationToken) => {
  const verificationUrl = `${config.FRONTEND_URL}/verify-new-email/${verificationToken}`;

  const mailOptions = {
    from: `"توصيلة Toosila" <${config.EMAIL_FROM}>`,
    to: newEmail,
    subject: 'تأكيد البريد الإلكتروني الجديد - Verify New Email',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .content { background-color: white; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h2>مرحباً ${name}،</h2>
            <p>تلقينا طلباً لتغيير عنوان بريدك الإلكتروني على توصيلة.</p>
            <p>لتأكيد البريد الإلكتروني الجديد، يرجى النقر على الزر أدناه:</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
            </div>

            <p><strong>ملاحظة:</strong> هذا الرابط صالح لمدة 24 ساعة فقط.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await sendEmail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email change verification:', error.message);
    throw new Error('Failed to send email change verification');
  }
};

/**
 * Test email configuration
 * @returns {Promise<object>} - Configuration status
 */
const testEmailConfiguration = async () => {
  if (emailProvider === 'resend') {
    // Resend HTTP API doesn't need connection verification
    return {
      success: true,
      provider: 'resend',
      message: 'Resend HTTP API configured'
    };
  } else if (emailProvider === 'sendgrid-api') {
    // SendGrid HTTP API doesn't need connection verification
    return {
      success: true,
      provider: 'sendgrid-api',
      message: 'SendGrid HTTP API configured'
    };
  } else if (emailProvider === 'smtp' && transporter) {
    try {
      await transporter.verify();
      return {
        success: true,
        provider: 'smtp',
        message: 'SMTP connection verified'
      };
    } catch (error) {
      return {
        success: false,
        provider: 'smtp',
        error: error.message
      };
    }
  } else {
    return {
      success: false,
      provider: 'none',
      message: 'No email provider configured'
    };
  }
};

/**
 * Send test email via Resend
 * @param {string} to - Recipient email
 * @returns {Promise<object>} - Send result
 */
const sendTestEmailViaResend = async (to) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const mailOptions = {
    from: config.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: to,
    subject: 'اختبار البريد - Test Email from Toosila',
    html: `
      <h1>مرحباً! 🎉</h1>
      <p>هذه رسالة اختبار من توصيلة.</p>
      <p>This is a test email from Toosila.</p>
      <p>Provider: Resend HTTP API</p>
      <p>Time: ${new Date().toISOString()}</p>
    `
  };

  return await sendViaResend(mailOptions);
};

/**
 * Get current email provider info
 * @returns {object} - Provider information
 */
const getEmailProviderInfo = () => ({
  provider: emailProvider,
  configured: emailProvider !== 'none'
});

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification,
  testEmailConfiguration,
  getEmailProviderInfo,
  sendTestEmailViaResend
};
