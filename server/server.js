require('dotenv').config();

const app = require('./app');
const config = require('./config/env');
const { pool } = require('./config/db');
const { initializeSocket } = require('./socket');
const logger = require('./config/logger');
const { logMetricsSummary } = require('./middlewares/metrics');
const { connect: connectRedis, disconnect: disconnectRedis } = require('./config/redis');

// Initialize Redis cache
connectRedis().catch(err => {
  logger.warn('Redis connection failed - continuing without cache', {
    error: err.message
  });
});

// Start server
const PORT = config.PORT;

const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: config.NODE_ENV,
    frontendUrl: config.FRONTEND_URL,
    database: `${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
    timestamp: new Date().toISOString(),
  });
});

// Initialize Socket.io
const io = initializeSocket(server);
logger.info('Socket.io initialized for real-time notifications');

// Make io instance available globally for controllers
app.set('io', io);

// Make database pool available globally for controllers
app.set('dbPool', pool);

// Log metrics summary every 15 minutes (optional)
if (config.NODE_ENV === 'production') {
  setInterval(logMetricsSummary, 15 * 60 * 1000); // 15 minutes
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception - Server will shut down', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection - Server will shut down', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Graceful shutdown with database pool draining
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close Redis connection
    try {
      await disconnectRedis();
      logger.info('Redis connection closed');
    } catch (err) {
      logger.warn('Error closing Redis connection', {
        error: err.message,
      });
    }

    // Close database connection pool
    try {
      await pool.end();
      logger.info('Database pool closed');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing database pool', {
        error: err.message,
        stack: err.stack,
      });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
