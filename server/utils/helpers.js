/**
 * Helper utility functions
 * Reusable helper functions to reduce code duplication
 */

const { PAGINATION, HTTP_STATUS } = require('../constants');

/**
 * Paginate a database query
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Object with limit and offset for query
 */
const paginate = (page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
  const validPage = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const validLimit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const offset = (validPage - 1) * validLimit;

  return {
    limit: validLimit,
    offset,
    page: validPage,
  };
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
const sendPaginatedResponse = (res, items, total, page, limit, message = 'Success') => {
  const pagination = getPaginationMeta(total, page, limit);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data: items,
    pagination,
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates the need for try-catch in every controller
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Pick specific fields from an object
 * @param {Object} object - Source object
 * @param {Array<string>} fields - Fields to pick
 * @returns {Object} Object with only specified fields
 */
const pick = (object, fields) => {
  return fields.reduce((obj, field) => {
    if (object && Object.prototype.hasOwnProperty.call(object, field)) {
      obj[field] = object[field];
    }
    return obj;
  }, {});
};

/**
 * Omit specific fields from an object
 * @param {Object} object - Source object
 * @param {Array<string>} fields - Fields to omit
 * @returns {Object} Object without specified fields
 */
const omit = (object, fields) => {
  const result = { ...object };
  fields.forEach((field) => {
    delete result[field];
  });
  return result;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Sanitize user input by trimming whitespace
 * @param {Object} data - Object with string values
 * @returns {Object} Sanitized object
 */
const sanitizeInput = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the specified time
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Format date to ISO string or custom format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
};

/**
 * Check if an object has all required fields
 * @param {Object} obj - Object to check
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} { valid: boolean, missing: Array<string> }
 */
const validateRequiredFields = (obj, requiredFields) => {
  const missing = requiredFields.filter((field) => isEmpty(obj[field]));
  return {
    valid: missing.length === 0,
    missing,
  };
};

module.exports = {
  paginate,
  getPaginationMeta,
  sendSuccess,
  sendPaginatedResponse,
  catchAsync,
  pick,
  omit,
  isEmpty,
  sanitizeInput,
  generateRandomString,
  sleep,
  formatDate,
  validateRequiredFields,
};
