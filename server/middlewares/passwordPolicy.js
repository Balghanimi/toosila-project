const logger = require('../config/logger');

/**
 * Password Policy Middleware
 * Enforces strong password requirements and prevents password reuse
 */

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password', 'password123', '12345678', '123456789', 'qwerty',
  'abc123', 'password1', 'admin', 'letmein', 'welcome',
  '123123', 'password!', 'admin123', 'root', 'toor',
  'pass', 'test', 'guest', 'user', '1234',
  '12345', '123456', '1234567', '12345678', '123456789',
  'qwerty123', 'password@123', 'admin@123'
];

// Arabic common passwords
const COMMON_ARABIC_PASSWORDS = [
  'كلمةالمرور', 'مرحبا', 'احبك'
];

// Minimum password requirements
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for better UX
  preventCommonPasswords: true,
  preventPasswordReuse: true,
  maxPasswordReuseHistory: 5
};

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  // Check length
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }

  if (password && password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
  }

  if (!password) {
    return { valid: false, errors };
  }

  // Check for uppercase
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters (optional)
  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  if (PASSWORD_POLICY.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword) || COMMON_ARABIC_PASSWORDS.includes(password)) {
      errors.push('This password is too common. Please choose a stronger password');
    }

    // Check if password contains common patterns
    if (/^(password|admin|user|test)/i.test(password)) {
      errors.push('Password contains common patterns. Please choose a more unique password');
    }

    // Check for sequential characters
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
      errors.push('Password contains sequential characters. Please choose a more complex password');
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password contains too many repeated characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Calculate password strength score (0-100)
 */
const calculatePasswordStrength = (password) => {
  let score = 0;

  if (!password) return 0;

  // Length score (up to 30 points)
  score += Math.min(password.length * 2, 30);

  // Character variety score (up to 40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

  // Uniqueness score (up to 30 points)
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 30);

  // Penalize common patterns
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.max(score - 50, 0);
  }

  return Math.min(score, 100);
};

/**
 * Middleware to validate password during registration/change
 */
const validatePassword = (req, res, next) => {
  const password = req.body.password || req.body.newPassword;

  if (!password) {
    return next(); // Let the validation middleware handle missing password
  }

  const validation = validatePasswordStrength(password);

  if (!validation.valid) {
    logger.warn('Password validation failed', {
      userId: req.user?.id,
      email: req.body.email,
      errors: validation.errors
    });

    return res.status(400).json({
      error: 'Weak password',
      message: 'Password does not meet security requirements',
      details: validation.errors
    });
  }

  // Add password strength to request for logging
  req.passwordStrength = calculatePasswordStrength(password);

  next();
};

/**
 * Check password against previous passwords (prevents reuse)
 * This should be called in the controller after retrieving user's password history
 */
const checkPasswordReuse = async (newPassword, passwordHistory = []) => {
  const bcrypt = require('bcrypt');

  if (!PASSWORD_POLICY.preventPasswordReuse) {
    return true;
  }

  // Check against last N passwords
  const recentPasswords = passwordHistory.slice(0, PASSWORD_POLICY.maxPasswordReuseHistory);

  for (const oldPasswordHash of recentPasswords) {
    const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
    if (isReused) {
      return false;
    }
  }

  return true;
};

/**
 * Generate password strength feedback for users
 */
const getPasswordStrengthFeedback = (password) => {
  const strength = calculatePasswordStrength(password);
  const validation = validatePasswordStrength(password);

  let level;
  let color;
  let message;

  if (strength < 40) {
    level = 'weak';
    color = 'red';
    message = 'Your password is weak. Please make it stronger.';
  } else if (strength < 70) {
    level = 'medium';
    color = 'orange';
    message = 'Your password is moderate. Consider making it stronger.';
  } else {
    level = 'strong';
    color = 'green';
    message = 'Your password is strong!';
  }

  return {
    score: strength,
    level,
    color,
    message,
    valid: validation.valid,
    errors: validation.errors
  };
};

/**
 * Check if password has been pwned (breached)
 * Uses Have I Been Pwned API (k-anonymity model)
 */
const checkPasswordPwned = async (password) => {
  const crypto = require('crypto');
  const https = require('https');

  try {
    // Hash the password using SHA-1
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // Query Have I Been Pwned API
    const response = await new Promise((resolve, reject) => {
      https.get(`https://api.pwnedpasswords.com/range/${prefix}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    // Check if our suffix is in the response
    const hashes = response.split('\r\n');
    for (const hash of hashes) {
      const [hashSuffix, count] = hash.split(':');
      if (hashSuffix === suffix) {
        return {
          pwned: true,
          count: parseInt(count)
        };
      }
    }

    return { pwned: false, count: 0 };
  } catch (error) {
    logger.error('Error checking password against HIBP', {
      error: error.message
    });
    // Don't fail validation if API is down
    return { pwned: false, count: 0 };
  }
};

module.exports = {
  validatePassword,
  validatePasswordStrength,
  calculatePasswordStrength,
  checkPasswordReuse,
  getPasswordStrengthFeedback,
  checkPasswordPwned,
  PASSWORD_POLICY
};
