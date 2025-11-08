/**
 * Email Service for Toosila
 * Handles sending emails for verification, password reset, notifications, etc.
 *
 * Supports multiple providers:
 * - Gmail SMTP
 * - SendGrid
 * - Mailgun
 * - Any SMTP server
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

// Create email transporter based on configuration
let transporter;

const initializeTransporter = () => {
  // Check if we're using SendGrid API key
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    // Mailgun configuration
    transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY
      }
    });
  } else {
    // Generic SMTP configuration (Gmail, etc.)
    transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
  }
};

// Initialize transporter
try {
  initializeTransporter();
} catch (error) {
  console.error('Failed to initialize email transporter:', error);
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
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
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email change verification:', error);
    throw new Error('Failed to send email change verification');
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Whether email is configured correctly
 */
const testEmailConfiguration = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification,
  testEmailConfiguration
};
