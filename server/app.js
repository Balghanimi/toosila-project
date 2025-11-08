const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Version: 1.1.0 - Fixed booking system to support seats and message

// Import configuration
const config = require('./config/env');

// Import middlewares
const { generalLimiter } = require('./middlewares/rateLimiters');
const { errorHandler, notFound } = require('./middlewares/error');
const { noCache, shortCache, mediumCache, etag } = require('./middlewares/cacheControl');

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

const app = express();

// Compression middleware - must be early in the middleware chain
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses if client doesn't accept encoding
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all requests
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (0-9, 6 is balanced)
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin, // ← ✅ متوافق مع architecture.md,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(express.json({ 
  limit: config.MAX_FILE_SIZE,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.MAX_FILE_SIZE 
}));

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint with memory monitoring
app.get('/api/health', (req, res) => {
  const used = process.memoryUsage();
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    memory: {
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`
    },
    uptime: `${Math.round(process.uptime())} seconds`
  });
});

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
app.use(errorHandler);

module.exports = app;

