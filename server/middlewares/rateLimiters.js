const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const config = require('../config/env');
const logger = require('../config/logger');

// Check if we're in development mode
const isDev = config.NODE_ENV === 'development';

// Store for tracking failed login attempts
const failedLoginAttempts = new Map();
const accountLockouts = new Map();

// Constants for account lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Helper function to check if account is locked
const isAccountLocked = (identifier) => {
  const lockout = accountLockouts.get(identifier);
  if (lockout && lockout.lockedUntil > Date.now()) {
    return true;
  }
  if (lockout && lockout.lockedUntil <= Date.now()) {
    accountLockouts.delete(identifier);
  }
  return false;
};

// Helper function to record failed login attempt
const recordFailedAttempt = (identifier) => {
  const now = Date.now();
  let attempts = failedLoginAttempts.get(identifier) || [];

  // Remove attempts older than ATTEMPT_WINDOW
  attempts = attempts.filter(timestamp => now - timestamp < ATTEMPT_WINDOW);
  attempts.push(now);

  failedLoginAttempts.set(identifier, attempts);

  // Check if we should lock the account
  if (attempts.length >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION;
    accountLockouts.set(identifier, { lockedUntil, attempts: attempts.length });
    logger.warn('Account locked due to too many failed login attempts', {
      identifier,
      attempts: attempts.length,
      lockedUntil: new Date(lockedUntil).toISOString()
    });
    return true; // Account is now locked
  }

  return false;
};

// Helper function to clear failed attempts on successful login
const clearFailedAttempts = (identifier) => {
  failedLoginAttempts.delete(identifier);
  accountLockouts.delete(identifier);
};

// Key generator for IP + User based rate limiting (IPv6 compatible)
const keyGenerator = (req) => {
  // Use ipKeyGenerator helper to properly handle IPv6 addresses
  const ip = ipKeyGenerator(req);
  const userId = req.user?.id;
  return userId ? `${ip}-user:${userId}` : ip;
};

// Skip handler for successful requests
const skipSuccessfulRequests = (req, res) => {
  return res.statusCode < 400;
};

// General API rate limiter
// Increased limits for production to handle multiple concurrent requests per user
// Each page load can trigger 5-10 API calls (offers, messages, notifications, bookings, etc.)
const generalLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : parseInt(config.RATE_LIMIT_WINDOW_MS), // 5 min in dev, config in prod
  max: isDev ? 200 : (parseInt(config.RATE_LIMIT_MAX_REQUESTS) || 500), // 200 in dev, 500 in prod (default)
  message: {
    error: 'Too many requests',
    message: isDev ? 'Too many requests (dev mode)' : 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((isDev ? 5 * 60 * 1000 : parseInt(config.RATE_LIMIT_WINDOW_MS)) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skipSuccessfulRequests: false, // Count all requests
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - General', {
      ip: req.ip,
      userId: req.user?.id,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many requests',
      message: isDev ? 'Too many requests (dev mode)' : 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((isDev ? 5 * 60 * 1000 : parseInt(config.RATE_LIMIT_WINDOW_MS)) / 1000)
    });
  }
});

// Auth rate limiter - VERY strict with progressive delays and account lockout
const authLimiter = rateLimit({
  windowMs: isDev ? 2 * 60 * 1000 : 15 * 60 * 1000, // 2 minutes in dev, 15 minutes in prod
  max: isDev ? 50 : 5, // 50 attempts in dev, 5 in prod
  message: {
    error: 'Too many authentication attempts',
    message: isDev ? 'Too many auth attempts (dev mode)' : 'Too many login attempts, please try again later.',
    retryAfter: isDev ? 120 : 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res) => {
    const identifier = keyGenerator(req);
    logger.warn('Rate limit exceeded - Authentication', {
      ip: req.ip,
      email: req.body?.email,
      identifier
    });
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many login attempts. Please try again later.',
      retryAfter: isDev ? 120 : 900
    });
  }
});

// Registration rate limiter - strict
const registerLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  max: isDev ? 20 : 3, // 20 in dev, 3 in prod
  message: {
    error: 'Too many registration attempts',
    message: isDev ? 'Too many registration attempts (dev mode)' : 'Too many registration attempts, please try again later.',
    retryAfter: isDev ? 300 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Registration', {
      ip: req.ip,
      email: req.body?.email
    });
    res.status(429).json({
      error: 'Too many registration attempts',
      message: 'Too many registration attempts. Please try again in an hour.',
      retryAfter: isDev ? 300 : 3600
    });
  }
});

// Moderate rate limiter for sensitive operations
const moderateLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min in dev, 15 minutes in prod
  max: isDev ? 100 : 20, // 100 in dev, 20 in prod
  message: {
    error: 'Too many requests',
    message: isDev ? 'Too many requests (dev mode)' : 'Too many requests for this operation, please try again later.',
    retryAfter: isDev ? 300 : 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Moderate operation', {
      ip: req.ip,
      userId: req.user?.id,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests for this operation. Please slow down.',
      retryAfter: isDev ? 300 : 900
    });
  }
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: isDev ? 10 * 60 * 1000 : 60 * 60 * 1000, // 10 min in dev, 1 hour in prod
  max: isDev ? 50 : 10, // 50 in dev, 10 in prod
  message: {
    error: 'Upload limit exceeded',
    message: isDev ? 'Too many uploads (dev mode)' : 'Too many uploads, please try again later.',
    retryAfter: isDev ? 600 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Upload', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'Too many file uploads. Please try again later.',
      retryAfter: isDev ? 600 : 3600
    });
  }
});

// Password reset rate limiter - very strict
const passwordResetLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  max: isDev ? 20 : 3, // 20 in dev, 3 in prod
  message: {
    error: 'Password reset limit exceeded',
    message: isDev ? 'Too many password reset attempts (dev mode)' : 'Too many password reset attempts, please try again later.',
    retryAfter: isDev ? 300 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Password reset', {
      ip: req.ip,
      email: req.body?.email
    });
    res.status(429).json({
      error: 'Password reset limit exceeded',
      message: 'Too many password reset requests. Please try again in an hour.',
      retryAfter: isDev ? 300 : 3600
    });
  }
});

// Create offer limiter - moderate
const createOfferLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  max: isDev ? 50 : 10, // 50 in dev, 10 offers per hour in prod
  message: {
    error: 'Too many offers created',
    message: isDev ? 'Too many offers (dev mode)' : 'Too many offers created. Please try again later.',
    retryAfter: isDev ? 300 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Create offer', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Too many offers created',
      message: 'You are creating too many offers. Please try again later.',
      retryAfter: isDev ? 300 : 3600
    });
  }
});

// Create booking limiter - moderate
const createBookingLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  max: isDev ? 100 : 20, // 100 in dev, 20 bookings per hour in prod
  message: {
    error: 'Too many bookings created',
    message: isDev ? 'Too many bookings (dev mode)' : 'Too many bookings created. Please try again later.',
    retryAfter: isDev ? 300 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Create booking', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Too many bookings created',
      message: 'You are creating too many bookings. Please try again later.',
      retryAfter: isDev ? 300 : 3600
    });
  }
});

// Message limiter - lenient but present
const messageLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  max: isDev ? 200 : 100, // 200 in dev, 100 messages per hour in prod
  message: {
    error: 'Too many messages sent',
    message: isDev ? 'Too many messages (dev mode)' : 'Too many messages sent. Please try again later.',
    retryAfter: isDev ? 300 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Messages', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Too many messages sent',
      message: 'You are sending too many messages. Please slow down.',
      retryAfter: isDev ? 300 : 3600
    });
  }
});

// Search limiter - lenient
const searchLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min in dev, 15 minutes in prod
  max: isDev ? 200 : 100, // 200 in dev, 100 searches per 15 min in prod
  message: {
    error: 'Too many search requests',
    message: isDev ? 'Too many searches (dev mode)' : 'Too many search requests. Please try again later.',
    retryAfter: isDev ? 300 : 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - Search', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Too many search requests',
      message: 'Too many search requests. Please try again later.',
      retryAfter: isDev ? 300 : 900
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  moderateLimiter,
  uploadLimiter,
  passwordResetLimiter,
  createOfferLimiter,
  createBookingLimiter,
  messageLimiter,
  searchLimiter,
  // Export account lockout helpers for use in auth controller
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts
};
