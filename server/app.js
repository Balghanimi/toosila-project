const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Version: 1.1.0 - Fixed booking system to support seats and message

// Import configuration
const config = require('./config/env');

// Import middlewares
const { generalLimiter } = require('./middlewares/rateLimiters');
const { errorHandler, notFound } = require('./middlewares/error');

// Import routes
const authRoutes = require('./routes/auth.routes');
const offersRoutes = require('./routes/offers.routes');
const demandsRoutes = require('./routes/demands.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const messagesRoutes = require('./routes/messages.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const statsRoutes = require('./routes/stats.routes');
const citiesRoutes = require('./routes/cities.routes');

const app = express();

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/demands', demandsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cities', citiesRoutes);

// Backward compatibility: Register routes without /api prefix
app.use('/auth', authRoutes);
app.use('/offers', offersRoutes);
app.use('/demands', demandsRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/messages', messagesRoutes);
app.use('/ratings', ratingsRoutes);
app.use('/stats', statsRoutes);
app.use('/cities', citiesRoutes);

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

