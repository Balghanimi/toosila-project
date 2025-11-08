require('dotenv').config();

const app = require('./app');
const config = require('./config/env');
const { pool } = require('./config/db');
const { initializeSocket } = require('./socket');

// Start server
const PORT = config.PORT;

const server = app.listen(PORT, () => {
  if (config.NODE_ENV === 'development') {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${config.FRONTEND_URL}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(`📊 Database: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
  }
});

// Initialize Socket.io
const io = initializeSocket(server);
if (config.NODE_ENV === 'development') {
  console.log('🔌 Socket.io initialized for real-time notifications');
}

// Make io instance available globally for controllers
app.set('io', io);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown with database pool draining
const gracefulShutdown = async (signal) => {
  if (config.NODE_ENV === 'development') {
    console.log(`${signal} received. Shutting down gracefully...`);
  }

  // Stop accepting new connections
  server.close(async () => {
    if (config.NODE_ENV === 'development') {
      console.log('HTTP server closed');
    }

    // Close database connection pool
    try {
      await pool.end();
      if (config.NODE_ENV === 'development') {
        console.log('Database pool closed');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
