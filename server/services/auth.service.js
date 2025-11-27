/**
 * Authentication Service
 * Handles business logic for user authentication
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/users.model');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateAccessToken } = require('../middlewares/auth');
const logger = require('../config/logger');
const {
  ConflictError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = require('../utils/errors');
const { BCRYPT, TOKEN_EXPIRY, USER_ROLES } = require('../constants');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {boolean} userData.isDriver - Whether user is a driver
   * @param {string} userData.languagePreference - User's language preference
   * @returns {Promise<Object>} Created user and verification status
   */
  async registerUser(userData) {
    const { name, email, password, isDriver = false, languagePreference = 'ar' } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT.SALT_ROUNDS);

    // Generate verification token
    const { token, hashedToken, expiry } = this.generateVerificationToken();

    // Create user with verification token
    const user = await User.create({
      name,
      email,
      passwordHash,
      isDriver,
      languagePreference,
      verificationToken: hashedToken,
      verificationTokenExpires: expiry,
      emailVerified: false,
    });

    // Send verification email (don't fail registration if email fails)
    await this.sendVerificationEmailSafe(email, name, token);

    return {
      user: user.toJSON(),
      requiresVerification: true,
    };
  }

  /**
   * Login a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data and JWT token
   */
  async loginUser(email, password) {
    // Find user with password hash
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    // TEMPORARY: Email verification check disabled for testing
    // TODO: Re-enable after testing is complete
    /*
    // Check email verification (skip for admin users)
    if (!user.email_verified && user.role !== USER_ROLES.ADMIN) {
      throw new EmailNotVerifiedError(
        'Please verify your email address before logging in. Check your inbox for the verification link.'
      );
    }
    */

    // Generate JWT token
    const token = generateAccessToken(user);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.toJSON();
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUserProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const mappedData = {};
    if (updateData.name !== undefined) mappedData.name = updateData.name;
    if (updateData.languagePreference !== undefined) {
      mappedData.language_preference = updateData.languagePreference;
    }
    if (updateData.isDriver !== undefined) mappedData.is_driver = updateData.isDriver;

    const updatedUser = await user.update(mappedData);
    return updatedUser.toJSON();
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} email - User email
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, email, currentPassword, newPassword) {
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

    // Update password
    await user.updatePassword(newPasswordHash);
  }

  /**
   * Update user email
   * @param {number} userId - User ID
   * @param {string} currentEmail - Current email
   * @param {string} newEmail - New email
   * @param {string} password - User password for verification
   * @returns {Promise<string>} New email
   */
  async updateEmail(userId, currentEmail, newEmail, password) {
    // Verify password first
    const user = await User.findByEmailWithPassword(currentEmail);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Password is incorrect');
    }

    // Check if new email already exists
    const existingUser = await User.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('Email already in use');
    }

    // Update email
    await user.update({ email: newEmail });
    return newEmail;
  }

  /**
   * Delete user account
   * @param {number} userId - User ID
   * @param {string} email - User email
   * @param {string} password - User password for verification
   * @param {string} confirmation - Confirmation text
   * @returns {Promise<void>}
   */
  async deleteAccount(userId, email, password, confirmation) {
    // Verify confirmation text
    if (confirmation !== 'DELETE') {
      throw new ValidationError('Please type DELETE to confirm');
    }

    // Verify password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Password is incorrect');
    }

    // Delete user (CASCADE will delete related records)
    await user.delete();
  }

  /**
   * Generate a verification token
   * @returns {Object} Token, hashed token, and expiry
   * @private
   */
  generateVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = new Date(Date.now() + TOKEN_EXPIRY.VERIFICATION_TOKEN);

    return { token, hashedToken, expiry };
  }

  /**
   * Send verification email safely (don't throw on failure)
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} token - Verification token
   * @returns {Promise<void>}
   * @private
   */
  async sendVerificationEmailSafe(email, name, token) {
    try {
      console.log('📧 Attempting to send verification email to:', email);
      await sendVerificationEmail(email, name, token);
      console.log('✅ Verification email sent successfully to:', email);
      logger.info('Verification email sent successfully', { email });
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', {
        email,
        error: emailError.message,
        stack: emailError.stack
      });
      logger.error('Failed to send verification email', {
        email,
        error: emailError.message,
        stack: emailError.stack
      });
      // Don't throw - continue with registration even if email fails
    }
  }
}

module.exports = new AuthService();
