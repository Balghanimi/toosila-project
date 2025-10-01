const validator = require('validator');

/**
 * Sanitize string input by trimming and escaping HTML
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return validator.escape(input.trim());
};

/**
 * Sanitize email address
 * @param {string} email - Email address
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return validator.normalizeEmail(email.trim().toLowerCase());
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number
 * @returns {string} Sanitized phone number
 */
const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters except + at the beginning
  return phone.replace(/[^\d+]/g, '').trim();
};

/**
 * Sanitize text content (for descriptions, comments, etc.)
 * @param {string} text - Text content
 * @param {number} maxLength - Maximum length allowed
 * @returns {string} Sanitized text
 */
const sanitizeText = (text, maxLength = 1000) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let sanitized = validator.escape(text.trim());
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitize URL
 * @param {string} url - URL string
 * @returns {string} Sanitized URL
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const trimmed = url.trim();
  if (validator.isURL(trimmed)) {
    return trimmed;
  }
  
  return '';
};

/**
 * Sanitize numeric input
 * @param {any} input - Input value
 * @param {number} defaultValue - Default value if input is invalid
 * @returns {number} Sanitized number
 */
const sanitizeNumber = (input, defaultValue = 0) => {
  if (typeof input === 'number' && !isNaN(input)) {
    return input;
  }
  
  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return defaultValue;
};

/**
 * Sanitize integer input
 * @param {any} input - Input value
 * @param {number} defaultValue - Default value if input is invalid
 * @returns {number} Sanitized integer
 */
const sanitizeInteger = (input, defaultValue = 0) => {
  if (typeof input === 'number' && Number.isInteger(input)) {
    return input;
  }
  
  if (typeof input === 'string') {
    const parsed = parseInt(input, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return defaultValue;
};

/**
 * Sanitize boolean input
 * @param {any} input - Input value
 * @param {boolean} defaultValue - Default value if input is invalid
 * @returns {boolean} Sanitized boolean
 */
const sanitizeBoolean = (input, defaultValue = false) => {
  if (typeof input === 'boolean') {
    return input;
  }
  
  if (typeof input === 'string') {
    const lower = input.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false;
    }
  }
  
  if (typeof input === 'number') {
    return input !== 0;
  }
  
  return defaultValue;
};

/**
 * Sanitize object by applying sanitization to all string properties
 * @param {Object} obj - Object to sanitize
 * @param {Object} schema - Schema defining sanitization rules
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, schema = {}) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const rule = schema[key];
    
    if (rule) {
      switch (rule.type) {
        case 'string':
          sanitized[key] = sanitizeString(value);
          break;
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = sanitizePhone(value);
          break;
        case 'text':
          sanitized[key] = sanitizeText(value, rule.maxLength);
          break;
        case 'url':
          sanitized[key] = sanitizeUrl(value);
          break;
        case 'number':
          sanitized[key] = sanitizeNumber(value, rule.default);
          break;
        case 'integer':
          sanitized[key] = sanitizeInteger(value, rule.default);
          break;
        case 'boolean':
          sanitized[key] = sanitizeBoolean(value, rule.default);
          break;
        default:
          sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Remove potentially dangerous characters from input
 * @param {string} input - Input string
 * @returns {string} Cleaned string
 */
const removeDangerousChars = (input) => {
  if (!input || typeof input !== 'string') {
    return input;
  }
  
  // Remove script tags and potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
};

/**
 * Sanitize file name
 * @param {string} filename - File name
 * @returns {string} Sanitized file name
 */
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  // Remove dangerous characters and limit length
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255)
    .trim();
};

/**
 * Sanitize search query
 * @param {string} query - Search query
 * @returns {string} Sanitized search query
 */
const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return query
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 100);
};

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  sanitizeUrl,
  sanitizeNumber,
  sanitizeInteger,
  sanitizeBoolean,
  sanitizeObject,
  removeDangerousChars,
  sanitizeFilename,
  sanitizeSearchQuery
};

