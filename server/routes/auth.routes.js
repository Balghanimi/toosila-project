const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updateEmail,
  deleteAccount,
  getUserStats,
  getAllUsers,
  getUserById,
  deactivateUser
} = require('../controllers/auth.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiters');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateId,
  validatePagination
} = require('../middlewares/validate');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account (passenger or driver) and send email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: أحمد محمد
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password (min 8 characters)
 *                 example: SecurePass123!
 *               isDriver:
 *                 type: boolean
 *                 default: false
 *                 description: Whether user is registering as a driver
 *               languagePreference:
 *                 type: string
 *                 enum: [ar, en, ku]
 *                 default: ar
 *                 description: User's preferred language
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful. Please check your email to verify your account.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     requiresVerification:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: User already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authLimiter, validateUserRegistration, register);

/**
 * @swagger
 * /auth/test-email-config:
 *   get:
 *     summary: Test email configuration (Development only)
 *     description: Check if email service is properly configured
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Email configuration status
 */
router.get('/test-email-config', async (req, res) => {
  const { testEmailConfiguration } = require('../utils/emailService');

  const config = {
    hasHost: !!process.env.EMAIL_HOST,
    hasUser: !!process.env.EMAIL_USER,
    hasPass: !!process.env.EMAIL_PASS,
    hasSendGrid: !!process.env.SENDGRID_API_KEY,
    hasMailgun: !!process.env.MAILGUN_API_KEY,
    frontendUrl: process.env.FRONTEND_URL || 'Not set',
    emailFrom: process.env.EMAIL_FROM || 'Not set',
    emailHost: process.env.EMAIL_HOST || 'Not set',
    emailPort: process.env.EMAIL_PORT || 'Not set',
    nodeEnv: process.env.NODE_ENV || 'Not set'
  };

  // Determine which email method is available
  let emailMethod = 'None configured';
  if (config.hasSendGrid) emailMethod = 'SendGrid';
  else if (config.hasMailgun) emailMethod = 'Mailgun';
  else if (config.hasHost && config.hasUser && config.hasPass) emailMethod = 'SMTP';

  // Test actual SMTP connection
  let smtpTest = { success: false, error: 'Not tested' };
  try {
    const connected = await testEmailConfiguration();
    smtpTest = { success: connected, error: connected ? null : 'Connection test returned false' };
  } catch (err) {
    smtpTest = { success: false, error: err.message };
  }

  res.json({
    success: smtpTest.success,
    emailMethod,
    smtpConnectionTest: smtpTest,
    config,
    message: emailMethod === 'None configured'
      ? 'No email service configured. Set EMAIL_HOST/USER/PASS or SENDGRID_API_KEY or MAILGUN_API_KEY'
      : smtpTest.success
        ? `Email service configured and verified via ${emailMethod}`
        : `Email service configured via ${emailMethod} but connection failed: ${smtpTest.error}`
  });
});

// TEMPORARY: Debug endpoint to list users
router.get('/debug-users', async (req, res) => {
  const { query } = require('../config/db');

  try {
    const result = await query(`
      SELECT id, name, email, role, is_driver, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({
      count: result.rows.length,
      users: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEMPORARY: Admin endpoint to find message sender
router.get('/find-message', async (req, res) => {
  const { query } = require('../config/db');
  const searchText = req.query.text;

  try {
    let result;
    if (searchText) {
      result = await query(`
        SELECT
          m.id,
          m.content,
          m.created_at,
          m.sender_id,
          m.ride_id,
          m.ride_type,
          u.name as sender_name,
          u.email as sender_email
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.content ILIKE $1
        ORDER BY m.created_at DESC
        LIMIT 20
      `, [`%${searchText}%`]);
    } else {
      // If no search text, return all recent messages
      result = await query(`
        SELECT
          m.id,
          m.content,
          m.created_at,
          m.sender_id,
          m.ride_id,
          m.ride_type,
          u.name as sender_name,
          u.email as sender_email
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        ORDER BY m.created_at DESC
        LIMIT 50
      `);
    }

    res.json({
      count: result.rows.length,
      messages: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authLimiter, validateUserLogin, login);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user (token validation)
 *     description: Validate JWT token and return current user data. Used by frontend to check token validity on app load.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid, user data returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 */
router.get('/me', getProfile);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: أحمد محمد العلي
 *               phone:
 *                 type: string
 *                 example: +9647XXXXXXXXX
 *               languagePreference:
 *                 type: string
 *                 enum: [ar, en, ku]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', validateUserUpdate, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change password
 *     description: Change authenticated user's password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many password change attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/change-password', passwordResetLimiter, changePassword);

/**
 * @swagger
 * /auth/update-email:
 *   put:
 *     summary: Update email address
 *     description: Update authenticated user's email address (requires re-verification)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - password
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Email updated, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid password or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/update-email', passwordResetLimiter, updateEmail);

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete authenticated user's account
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/delete-account', passwordResetLimiter, deleteAccount);

/**
 * @swagger
 * /auth/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics for authenticated user (rides, bookings, ratings)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOffers:
 *                       type: integer
 *                       example: 12
 *                     totalDemands:
 *                       type: integer
 *                       example: 5
 *                     totalBookings:
 *                       type: integer
 *                       example: 8
 *                     averageRating:
 *                       type: number
 *                       example: 4.5
 */
router.get('/stats', getUserStats);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve paginated list of all users - Admin access required
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users', requireAdmin, validatePagination, getAllUsers);

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     description: Retrieve specific user details by ID - Admin access required
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/:id', requireAdmin, validateId, getUserById);

/**
 * @swagger
 * /auth/users/{id}/deactivate:
 *   put:
 *     summary: Deactivate user (Admin only)
 *     description: Deactivate or activate a user account - Admin access required
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/users/:id/deactivate', requireAdmin, validateId, deactivateUser);

module.exports = router;

