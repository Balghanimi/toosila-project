const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Version: 1.1.0 - Fixed booking system to support seats and message

// Import configuration
const config = require('./config/env');
const logger = require('./config/logger');
const { initializeSentry, sentryErrorHandler } = require('./config/sentry');

// Import middlewares
const { generalLimiter } = require('./middlewares/rateLimiters');
const { errorHandler, notFound } = require('./middlewares/error');
const { noCache, shortCache, mediumCache, etag } = require('./middlewares/cacheControl');
const { metricsMiddleware } = require('./middlewares/metrics');
const { performanceMiddleware } = require('./middlewares/performance');

// Import routes
const authRoutes = require('./routes/auth.routes');
const offersRoutes = require('./routes/offers.routes');
const demandsRoutes = require('./routes/demands.routes');
const demandResponsesRoutes = require('./routes/demandResponses.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const messagesRoutes = require('./routes/messages.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const statsRoutes = require('./routes/stats.routes');
const citiesRoutes = require('./routes/cities.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const verificationRoutes = require('./routes/verification.routes');
const emailVerificationRoutes = require('./routes/emailVerification.routes');
const passwordResetRoutes = require('./routes/passwordReset.routes');
const healthRoutes = require('./routes/health.routes');
const adminRoutes = require('./routes/admin.routes');
const otpRoutes = require('./routes/otp.routes');

const app = express();

// Initialize Sentry (must be first)
initializeSentry(app);

// Trust proxy for Railway deployment
// This allows Express to correctly read X-Forwarded-For headers from Railway's reverse proxy
app.set('trust proxy', 1);

// Compression middleware - must be early in the middleware chain
app.use(
  compression({
    filter: (req, res) => {
      // Don't compress responses if client doesn't accept encoding
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression for all requests
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (0-9, 6 is balanced)
  })
);

// Enhanced Security middleware with comprehensive CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], // unsafe-inline needed for some React styles, allow Google Fonts
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://toosila-backend-production.up.railway.app'], // Allow API calls
        fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Allow Google Fonts
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'data:'], // Allow data URIs for notification sounds
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
    dnsPrefetchControl: {
      allow: false,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin, // ← ✅ متوافق مع architecture.md,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(
  express.json({
    limit: config.MAX_FILE_SIZE,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: config.MAX_FILE_SIZE,
  })
);

// Logging middleware - integrate Morgan with Winston
app.use(morgan('combined', { stream: logger.stream }));

// Performance middleware - track and log slow requests (>500ms)
app.use(performanceMiddleware);

// Metrics middleware - track request performance
app.use(metricsMiddleware);

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Toosila API Documentation',
  })
);

// Health check routes (comprehensive monitoring)
app.use('/api/health', healthRoutes);

// API routes with cache control
app.use('/api/auth', noCache, authRoutes); // No cache for auth
app.use('/api/offers', shortCache, etag, offersRoutes); // 5 min cache for offers
app.use('/api/demands', shortCache, etag, demandsRoutes); // 5 min cache for demands
app.use('/api/demand-responses', shortCache, demandResponsesRoutes);
app.use('/api/bookings', noCache, bookingsRoutes); // No cache for user bookings
app.use('/api/messages', noCache, messagesRoutes); // No cache for messages
app.use('/api/ratings', mediumCache, ratingsRoutes); // 1 hour cache for ratings
app.use('/api/stats', mediumCache, statsRoutes); // 1 hour cache for stats
app.use('/api/cities', mediumCache, citiesRoutes); // 1 hour cache for cities
app.use('/api/notifications', noCache, notificationsRoutes); // No cache for notifications
app.use('/api/verification', noCache, verificationRoutes);
app.use('/api/email-verification', noCache, emailVerificationRoutes);
app.use('/api/password-reset', noCache, passwordResetRoutes);
app.use('/api/admin', noCache, adminRoutes); // Admin routes for migrations
app.use('/api/otp', noCache, otpRoutes); // OTP phone verification routes

// Serve static files from React build (production only)
if (config.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));

  // Handle React client-side routing - catch all non-API routes
  // Express 5: Use splat parameter for catch-all routes
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());
app.use(errorHandler);

module.exports = app;
