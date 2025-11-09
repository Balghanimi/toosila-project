const logger = require('../config/logger');
const onFinished = require('on-headers');

/**
 * Metrics middleware for tracking API requests and performance
 * Logs all API requests with detailed information including response time
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to capture metrics when response is sent
  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    // Get user ID if authenticated
    const userId = req.user?.id || 'anonymous';

    // Get response size (approximate)
    const responseSize = parseInt(res.get('Content-Length') || 0);

    // Determine log level based on status code and duration
    let level = 'http';
    if (statusCode >= 500) {
      level = 'error';
    } else if (statusCode >= 400) {
      level = 'warn';
    } else if (duration > 1000) {
      // Slow requests (>1s) logged as warning
      level = 'warn';
    }

    // Build log metadata
    const logData = {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      responseSize: `${(responseSize / 1024).toFixed(2)}KB`,
      userId,
      ip: ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Add slow query flag if applicable
    if (duration > 1000) {
      logData.slow = true;
      logData.threshold = '1000ms';
    }

    // Log the request
    const message = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

    if (level === 'error') {
      logger.error(message, logData);
    } else if (level === 'warn') {
      logger.warn(message, logData);
    } else {
      logger.http(message, logData);
    }

    // Track metrics for performance monitoring
    trackMetrics(method, originalUrl, statusCode, duration);

    // Call original end function
    return originalEnd.apply(res, args);
  };

  next();
};

/**
 * In-memory metrics tracking (for demonstration)
 * In production, you would send these to a monitoring service like Prometheus, Datadog, etc.
 */
const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byStatus: {},
    byEndpoint: {},
  },
  performance: {
    totalDuration: 0,
    slowRequests: 0,
    averageResponseTime: 0,
  },
  errors: {
    total: 0,
    byEndpoint: {},
  },
};

const trackMetrics = (method, url, statusCode, duration) => {
  // Increment total requests
  metrics.requests.total++;

  // Track by method
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;

  // Track by status code
  const statusGroup = `${Math.floor(statusCode / 100)}xx`;
  metrics.requests.byStatus[statusGroup] = (metrics.requests.byStatus[statusGroup] || 0) + 1;

  // Track by endpoint (simplified - group similar endpoints)
  const endpoint = simplifyEndpoint(url);
  if (!metrics.requests.byEndpoint[endpoint]) {
    metrics.requests.byEndpoint[endpoint] = {
      count: 0,
      totalDuration: 0,
      errors: 0,
    };
  }
  metrics.requests.byEndpoint[endpoint].count++;
  metrics.requests.byEndpoint[endpoint].totalDuration += duration;

  // Track performance
  metrics.performance.totalDuration += duration;
  metrics.performance.averageResponseTime =
    metrics.performance.totalDuration / metrics.requests.total;

  if (duration > 1000) {
    metrics.performance.slowRequests++;
  }

  // Track errors
  if (statusCode >= 400) {
    metrics.errors.total++;
    metrics.requests.byEndpoint[endpoint].errors++;

    if (!metrics.errors.byEndpoint[endpoint]) {
      metrics.errors.byEndpoint[endpoint] = 0;
    }
    metrics.errors.byEndpoint[endpoint]++;
  }
};

/**
 * Simplify endpoint for grouping (replace IDs with :id)
 * @param {string} url - The URL to simplify
 * @returns {string} Simplified URL
 */
const simplifyEndpoint = (url) => {
  // Remove query parameters
  const path = url.split('?')[0];

  // Replace UUIDs and numeric IDs with :id
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
};

/**
 * Get current metrics (for health check or monitoring endpoint)
 * @returns {Object} Current metrics
 */
const getMetrics = () => {
  return {
    ...metrics,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
};

/**
 * Reset metrics (useful for testing or periodic resets)
 */
const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    byMethod: {},
    byStatus: {},
    byEndpoint: {},
  };
  metrics.performance = {
    totalDuration: 0,
    slowRequests: 0,
    averageResponseTime: 0,
  };
  metrics.errors = {
    total: 0,
    byEndpoint: {},
  };

  logger.info('Metrics reset');
};

/**
 * Log metrics summary periodically
 * Call this with setInterval to log metrics every N minutes
 */
const logMetricsSummary = () => {
  const summary = {
    totalRequests: metrics.requests.total,
    averageResponseTime: `${Math.round(metrics.performance.averageResponseTime)}ms`,
    slowRequests: metrics.performance.slowRequests,
    errorRate: `${((metrics.errors.total / metrics.requests.total) * 100).toFixed(2)}%`,
    topEndpoints: Object.entries(metrics.requests.byEndpoint)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        avgDuration: `${Math.round(data.totalDuration / data.count)}ms`,
      })),
  };

  logger.logMetrics(summary);
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  resetMetrics,
  logMetricsSummary,
};
