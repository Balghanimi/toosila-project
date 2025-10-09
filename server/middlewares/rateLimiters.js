const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Check if we're in development mode
const isDev = config.NODE_ENV === 'development';

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : parseInt(config.RATE_LIMIT_WINDOW_MS), // 5 min in dev, config in prod
  max: isDev ? 100 : parseInt(config.RATE_LIMIT_MAX_REQUESTS), // 100 in dev, config in prod
  message: {
    error: 'Too many requests',
    message: isDev ? 'Too many requests (dev mode)' : 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((isDev ? 5 * 60 * 1000 : parseInt(config.RATE_LIMIT_WINDOW_MS)) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - more flexible in development
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
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min in dev, 1 hour in prod
  max: isDev ? 20 : 3, // 10 in dev, 3 in prod
  message: {
    error: 'Password reset limit exceeded',
    message: isDev ? 'Too many password reset attempts (dev mode)' : 'Too many password reset attempts, please try again later.',
    retryAfter: isDev ? 300 : 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  moderateLimiter,
  uploadLimiter,
  passwordResetLimiter
};

