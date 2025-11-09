/**
 * Custom error classes for the application
 * Provides consistent error handling across the application
 */

const { ERROR_CODES, HTTP_STATUS } = require('../constants');

/**
 * Base application error class
 * All custom errors should extend this class
 */
class AppError extends Error {
  /**
   * Creates a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code for client identification
   */
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 */
class ValidationError extends AppError {
  /**
   * Creates a new ValidationError
   * @param {string} message - Error message
   * @param {Array} details - Array of validation error details
   */
  constructor(message, details = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

/**
 * Error for when a requested resource is not found
 */
class NotFoundError extends AppError {
  /**
   * Creates a new NotFoundError
   * @param {string} resource - Name of the resource that was not found
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    this.resource = resource;
  }
}

/**
 * Error for unauthorized access (not authenticated)
 */
class UnauthorizedError extends AppError {
  /**
   * Creates a new UnauthorizedError
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
}

/**
 * Error for forbidden access (authenticated but not authorized)
 */
class ForbiddenError extends AppError {
  /**
   * Creates a new ForbiddenError
   * @param {string} message - Error message
   */
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }
}

/**
 * Error for conflicts (e.g., duplicate resources)
 */
class ConflictError extends AppError {
  /**
   * Creates a new ConflictError
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
  }
}

/**
 * Error for invalid credentials during authentication
 */
class InvalidCredentialsError extends AppError {
  /**
   * Creates a new InvalidCredentialsError
   * @param {string} message - Error message
   */
  constructor(message = 'Invalid credentials') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
  }
}

/**
 * Error for when email is not verified
 */
class EmailNotVerifiedError extends AppError {
  /**
   * Creates a new EmailNotVerifiedError
   * @param {string} message - Error message
   */
  constructor(message = 'Email not verified. Please verify your email to continue.') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.EMAIL_NOT_VERIFIED);
  }
}

/**
 * Error for invalid or malformed tokens
 */
class InvalidTokenError extends AppError {
  /**
   * Creates a new InvalidTokenError
   * @param {string} message - Error message
   */
  constructor(message = 'Invalid or malformed token') {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_TOKEN);
  }
}

/**
 * Error for expired tokens
 */
class TokenExpiredError extends AppError {
  /**
   * Creates a new TokenExpiredError
   * @param {string} message - Error message
   */
  constructor(message = 'Token has expired') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
  }
}

/**
 * Error handler middleware for Express
 * Formats errors consistently and logs them
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  const logger = require('../config/logger');
  logger.error('Error occurred', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Operational errors (trusted errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Programming or unknown errors (don't leak details to client)
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.SERVER_ERROR,
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  InvalidTokenError,
  TokenExpiredError,
  errorHandler,
};
