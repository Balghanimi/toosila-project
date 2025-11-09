/**
 * Application-wide constants
 * Centralizes magic strings and configuration values
 */

// Booking statuses
const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// User roles
const USER_ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// Verification statuses
const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Notification types
const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  MESSAGE: 'message',
  RATING: 'rating',
  VERIFICATION: 'verification',
  SYSTEM: 'system',
  DEMAND_RESPONSE: 'demand_response',
};

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR',
  USER_EXISTS: 'USER_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
};

// Rate limits
const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  REGISTER: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 requests per hour
  GENERAL: { windowMs: 15 * 60 * 1000, max: 500 }, // 500 requests per 15 minutes
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 requests per hour
  EMAIL_VERIFICATION: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 requests per hour
};

// Cache TTLs (in seconds)
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

// Token expiry times
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  VERIFICATION_TOKEN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  PASSWORD_RESET_TOKEN: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File upload limits
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Email verification
const EMAIL = {
  VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
};

// Bcrypt
const BCRYPT = {
  SALT_ROUNDS: 12,
};

// Response messages
const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  REGISTRATION_SUCCESS: 'Registration successful. Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  BOOKING_STATUS,
  USER_ROLES,
  VERIFICATION_STATUS,
  NOTIFICATION_TYPES,
  ERROR_CODES,
  RATE_LIMITS,
  CACHE_TTL,
  TOKEN_EXPIRY,
  PAGINATION,
  FILE_UPLOAD,
  EMAIL,
  BCRYPT,
  RESPONSE_MESSAGES,
  HTTP_STATUS,
};
