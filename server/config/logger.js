const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about the colors
winston.addColors(colors);

// Determine the log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Format for log files (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Format for console output (colorized and pretty)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      let metaString = '';

      // Filter out sensitive data from logs
      const filteredMeta = filterSensitiveData(meta);

      if (Object.keys(filteredMeta).length > 0) {
        metaString = `\n${JSON.stringify(filteredMeta, null, 2)}`;
      }

      return `${timestamp} [${level}]: ${message}${metaString}`;
    }
  )
);

// Filter sensitive data from logs
const filterSensitiveData = (obj) => {
  const sensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'secret', 'apiKey', 'api_key'];
  const filtered = { ...obj };

  for (const key in filtered) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      filtered[key] = '[REDACTED]';
    } else if (typeof filtered[key] === 'object' && filtered[key] !== null) {
      filtered[key] = filterSensitiveData(filtered[key]);
    }
  }

  return filtered;
};

// Define transports
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Daily rotate file for all logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d', // Keep logs for 14 days
    format: fileFormat,
    level: 'debug',
  }),

  // Separate file for errors only
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs for 30 days
    format: fileFormat,
    level: 'error',
  }),

  // Separate file for HTTP requests
  new DailyRotateFile({
    filename: path.join(logsDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d', // Keep HTTP logs for 7 days
    format: fileFormat,
    level: 'http',
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false, // Don't exit on handled errors
});

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods for common logging patterns
logger.logRequest = (req, message = 'Request received') => {
  logger.http(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status || error.statusCode,
    },
    ...context,
  });
};

logger.logDatabaseQuery = (query, duration, rowCount) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger.log(level, 'Database query executed', {
    query: query.substring(0, 200), // Limit query length in logs
    duration: `${duration}ms`,
    rowCount,
    slow: duration > 1000,
  });
};

logger.logMetrics = (metrics) => {
  logger.info('Application metrics', metrics);
};

// Export the logger
module.exports = logger;
