const validator = require('validator');
const { sanitizeString, sanitizeEmail, sanitizeText } = require('../utils/sanitize');
const logger = require('../config/logger');

/**
 * Comprehensive input sanitization middleware
 * Sanitizes all request inputs to prevent XSS, injection attacks, and other vulnerabilities
 */

// List of dangerous patterns to check for
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi // SVG can contain scripts
];

/**
 * Check if input contains dangerous content
 */
const containsDangerousContent = (value) => {
  if (typeof value !== 'string') return false;
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(value));
};

/**
 * Sanitize a single value based on its type
 */
const sanitizeValue = (value, key, options = {}) => {
  if (value === null || value === undefined) {
    return value;
  }

  // Arrays - sanitize each element
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, key, options));
  }

  // Objects - sanitize recursively
  if (typeof value === 'object') {
    const sanitized = {};
    for (const [objKey, objValue] of Object.entries(value)) {
      sanitized[objKey] = sanitizeValue(objValue, objKey, options);
    }
    return sanitized;
  }

  // Strings - apply sanitization
  if (typeof value === 'string') {
    // Check for dangerous content first
    if (containsDangerousContent(value)) {
      logger.warn('Dangerous content detected in input', {
        key,
        value: value.substring(0, 100) // Log first 100 chars only
      });
      // Strip all HTML for safety
      return validator.stripLow(validator.escape(value));
    }

    // Email fields
    if (key.toLowerCase().includes('email')) {
      return sanitizeEmail(value);
    }

    // URL fields
    if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
      const trimmed = value.trim();
      if (validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
        return trimmed;
      }
      return '';
    }

    // Phone fields
    if (key.toLowerCase().includes('phone')) {
      return value.replace(/[^\d+]/g, '').trim();
    }

    // Text content fields (descriptions, comments, messages, etc.)
    if (key.toLowerCase().includes('message') ||
        key.toLowerCase().includes('comment') ||
        key.toLowerCase().includes('description') ||
        key.toLowerCase().includes('notes')) {
      return sanitizeText(value, options.maxLength || 2000);
    }

    // Default: escape HTML and trim
    return sanitizeString(value);
  }

  // Numbers, booleans, etc. - return as is
  return value;
};

/**
 * Main sanitization middleware
 * Sanitizes req.body, req.query, and req.params
 */
const sanitizeInputs = (options = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body, 'body', options);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeValue(req.query, 'query', options);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeValue(req.params, 'params', options);
      }

      next();
    } catch (error) {
      logger.error('Error in sanitization middleware', {
        error: error.message,
        path: req.path
      });
      res.status(500).json({
        error: 'Input processing error',
        message: 'Failed to process request input'
      });
    }
  };
};

/**
 * Strict sanitization for authentication endpoints
 * More aggressive sanitization for login/register
 */
const sanitizeAuthInputs = (req, res, next) => {
  try {
    if (req.body) {
      // Email - normalize and validate
      if (req.body.email) {
        req.body.email = sanitizeEmail(req.body.email);
      }

      // Name - strict sanitization
      if (req.body.name) {
        req.body.name = validator.escape(req.body.name.trim());
        // Only allow letters, spaces, Arabic characters
        if (!/^[\p{L}\s'-]+$/u.test(req.body.name)) {
          return res.status(400).json({
            error: 'Invalid name format',
            message: 'Name can only contain letters, spaces, and hyphens'
          });
        }
      }

      // Password - no sanitization, but check length
      if (req.body.password && req.body.password.length > 128) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password is too long'
        });
      }

      // Language preference - whitelist
      if (req.body.languagePreference) {
        if (!['ar', 'en', 'ku'].includes(req.body.languagePreference)) {
          req.body.languagePreference = 'ar';
        }
      }

      // Phone - sanitize
      if (req.body.phone) {
        req.body.phone = req.body.phone.replace(/[^\d+]/g, '').trim();
      }
    }

    next();
  } catch (error) {
    logger.error('Error in auth sanitization middleware', {
      error: error.message
    });
    res.status(500).json({
      error: 'Input processing error',
      message: 'Failed to process authentication input'
    });
  }
};

/**
 * Sanitization for file uploads
 */
const sanitizeFileInputs = (req, res, next) => {
  try {
    // Sanitize file metadata
    if (req.file) {
      // Sanitize original filename
      if (req.file.originalname) {
        req.file.originalname = req.file.originalname
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .substring(0, 255);
      }
    }

    if (req.files && Array.isArray(req.files)) {
      req.files = req.files.map(file => {
        if (file.originalname) {
          file.originalname = file.originalname
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .substring(0, 255);
        }
        return file;
      });
    }

    next();
  } catch (error) {
    logger.error('Error in file sanitization middleware', {
      error: error.message
    });
    res.status(500).json({
      error: 'File processing error',
      message: 'Failed to process file upload'
    });
  }
};

/**
 * SQL injection prevention middleware
 * Additional layer of defense even though we use parameterized queries
 */
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi, // SQL comment and quote chars
    /(\bOR\b.*\=)|(\bAND\b.*\=)/gi, // OR/AND with equals
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi // SQL keywords
  ];

  const checkForSQLInjection = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const scanObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (checkForSQLInjection(value)) {
        logger.warn('Potential SQL injection detected', {
          key,
          value: typeof value === 'string' ? value.substring(0, 100) : value,
          ip: req.ip,
          path: req.path
        });
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (scanObject(value)) return true;
      }
    }
    return false;
  };

  try {
    // Check body, query, and params
    const inputs = [req.body, req.query, req.params].filter(Boolean);

    for (const input of inputs) {
      if (scanObject(input)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Your request contains potentially dangerous content'
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error in SQL injection prevention middleware', {
      error: error.message
    });
    next();
  }
};

/**
 * XSS prevention middleware
 * Blocks requests with obvious XSS attempts
 */
const preventXSS = (req, res, next) => {
  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && containsDangerousContent(value)) {
        logger.warn('Potential XSS attempt detected', {
          key,
          value: value.substring(0, 100),
          ip: req.ip,
          path: req.path
        });
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) return true;
      }
    }
    return false;
  };

  try {
    const inputs = [req.body, req.query, req.params].filter(Boolean);

    for (const input of inputs) {
      if (checkObject(input)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Your request contains potentially dangerous content'
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error in XSS prevention middleware', {
      error: error.message
    });
    next();
  }
};

/**
 * NoSQL injection prevention
 * Prevents MongoDB-style injection attacks
 */
const preventNoSQLInjection = (req, res, next) => {
  const checkForNoSQLInjection = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      // Check for MongoDB operators
      if (key.startsWith('$') || key.startsWith('_')) {
        logger.warn('Potential NoSQL injection detected', {
          key,
          ip: req.ip,
          path: req.path
        });
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (checkForNoSQLInjection(value)) return true;
      }
    }
    return false;
  };

  try {
    const inputs = [req.body, req.query].filter(Boolean);

    for (const input of inputs) {
      if (checkForNoSQLInjection(input)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Your request contains invalid parameters'
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error in NoSQL injection prevention middleware', {
      error: error.message
    });
    next();
  }
};

module.exports = {
  sanitizeInputs,
  sanitizeAuthInputs,
  sanitizeFileInputs,
  preventSQLInjection,
  preventXSS,
  preventNoSQLInjection,
  containsDangerousContent,
  sanitizeValue
};
