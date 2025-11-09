/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const logger = require('../config/logger');
const { captureException } = require('../config/sentry');
const { errorHandler: customErrorHandler } = require('../utils/errors');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error with structured logging
  logger.error('Request error', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id,
    },
  });

  // Send to Sentry for 5xx errors
  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  if (statusCode >= 500 && process.env.SENTRY_DSN) {
    captureException(err, {
      user: req.user,
      tags: {
        endpoint: req.originalUrl,
        method: req.method,
      },
      extra: {
        body: req.body,
        query: req.query,
        params: req.params,
      },
    });
  }

  // Handle custom operational errors
  if (err.isOperational) {
    return customErrorHandler(err, req, res, next);
  }

  // Handle specific error types
  const error = handleSpecificErrors(err);

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * Handle specific error types
 * @param {Error} err - Error object
 * @returns {Object} Formatted error object
 * @private
 */
const handleSpecificErrors = (err) => {
  let error = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: err.code || ERROR_CODES.SERVER_ERROR,
  };

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.INVALID_TOKEN,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.TOKEN_EXPIRED,
    };
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    // Unique violation
    error = {
      message: 'Duplicate entry',
      statusCode: HTTP_STATUS.CONFLICT,
      code: ERROR_CODES.CONFLICT,
    };
  }

  if (err.code === '23503') {
    // Foreign key violation
    error = {
      message: 'Referenced record not found',
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.NOT_FOUND,
    };
  }

  if (err.code === '23502') {
    // Not null violation
    const column = err.column || 'unknown';
    error = {
      message: `Required field missing: ${column}`,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
    };
  }

  // Rate limit error
  if (err.status === 429 || err.statusCode === 429) {
    error = {
      message: 'Too many requests. Please try again later.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 413,
      code: 'FILE_TOO_LARGE',
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 413,
      code: 'TOO_MANY_FILES',
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const messages = err.errors
      ? Object.values(err.errors).map((val) => val.message)
      : [err.message];
    error = {
      message: 'Validation Error',
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      details: messages,
    };
  }

  return error;
};

/**
 * 404 Not Found handler
 * Handles routes that don't exist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  error.code = ERROR_CODES.NOT_FOUND;
  error.isOperational = true;
  next(error);
};

/**
 * Async error wrapper (deprecated - use catchAsync from helpers instead)
 * @deprecated Use catchAsync from utils/helpers.js
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class (deprecated - use errors from utils/errors.js instead)
 * @deprecated Use error classes from utils/errors.js
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
};
