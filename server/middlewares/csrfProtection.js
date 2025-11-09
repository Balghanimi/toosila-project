const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

// Store for CSRF tokens (in production, use Redis or session store)
const tokenStore = new Map();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate CSRF token
 */
const generateCSRFToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRY;

  tokenStore.set(token, {
    userId,
    expiresAt
  });

  // Clean up expired tokens periodically
  cleanupExpiredTokens();

  return token;
};

/**
 * Validate CSRF token
 */
const validateCSRFToken = (token, userId) => {
  const tokenData = tokenStore.get(token);

  if (!tokenData) {
    return false;
  }

  // Check if token is expired
  if (Date.now() > tokenData.expiresAt) {
    tokenStore.delete(token);
    return false;
  }

  // Check if token belongs to the user
  if (tokenData.userId !== userId) {
    return false;
  }

  return true;
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
};

/**
 * CSRF protection middleware for state-changing operations
 * Validates CSRF token from header or body
 */
const csrfProtection = (req, res, next) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for non-authenticated requests
  if (!req.user) {
    return next();
  }

  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!token) {
    logger.warn('CSRF token missing', {
      userId: req.user.id,
      ip: req.ip,
      path: req.path
    });

    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'Missing CSRF token'
    });
  }

  // Validate token
  if (!validateCSRFToken(token, req.user.id)) {
    logger.warn('Invalid CSRF token', {
      userId: req.user.id,
      ip: req.ip,
      path: req.path,
      token: token.substring(0, 10) + '...'
    });

    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'Invalid or expired CSRF token'
    });
  }

  next();
};

/**
 * Generate and send CSRF token
 * Add this to authenticated routes that need CSRF protection
 */
const sendCSRFToken = (req, res, next) => {
  if (req.user) {
    const csrfToken = generateCSRFToken(req.user.id);
    res.setHeader('X-CSRF-Token', csrfToken);
  }
  next();
};

/**
 * Verify Origin header to prevent CSRF
 * Alternative/additional protection method
 */
const verifyOrigin = (req, res, next) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

  if (!origin) {
    // No origin header - might be same-origin request or API client
    // Allow but log for monitoring
    logger.info('Request without origin header', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });
    return next();
  }

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    try {
      const originURL = new URL(origin);
      const allowedURL = new URL(allowed);
      return originURL.origin === allowedURL.origin;
    } catch (e) {
      return false;
    }
  });

  if (!isAllowed) {
    logger.warn('Request from unauthorized origin', {
      origin,
      ip: req.ip,
      path: req.path
    });

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Request from unauthorized origin'
    });
  }

  next();
};

/**
 * SameSite cookie configuration helper
 * Use this when setting authentication cookies
 */
const sameSiteCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // or 'lax' for more compatibility
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

module.exports = {
  csrfProtection,
  sendCSRFToken,
  verifyOrigin,
  generateCSRFToken,
  validateCSRFToken,
  sameSiteCookieConfig
};
