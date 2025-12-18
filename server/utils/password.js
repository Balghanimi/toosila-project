/**
 * Password Hashing and Verification Utilities
 * Using bcrypt for secure password storage
 */
const bcrypt = require('bcrypt');

// Salt rounds for bcrypt (10 is a good balance between security and performance)
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * @param {string} plainPassword - The plain text password
 * @returns {Promise<string>} The hashed password
 */
async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (plainPassword.length < 5) {
    throw new Error('Password must be at least 5 characters long');
  }

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plain text password against a hashed password
 * @param {string} plainPassword - The plain text password to verify
 * @param {string} hashedPassword - The hashed password from database
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with isValid and message
 */
function validatePasswordStrength(password) {
  const minLength = 5;
  const errors = [];

  if (!password) {
    return { isValid: false, message: 'كلمة المرور مطلوبة' };
  }

  if (password.length < minLength) {
    errors.push(`كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`);
  }

  // Optional: Add more strength checks
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  // }

  if (errors.length > 0) {
    return { isValid: false, message: errors.join('. ') };
  }

  return { isValid: true, message: 'كلمة المرور صالحة' };
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
};
