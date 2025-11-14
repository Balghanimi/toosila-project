/**
 * Performance Monitoring Middleware
 *
 * Tracks and logs slow endpoints, database query times, and performance metrics
 */

const logger = require('../config/logger');

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  SLOW_REQUEST: 1000,      // Requests slower than 1 second
  VERY_SLOW_REQUEST: 3000, // Requests slower than 3 seconds
  WARNING_REQUEST: 500     // Requests that might become slow
};

// Performance metrics storage (in-memory, consider Redis for production)
const metrics = {
  slowEndpoints: new Map(),
  totalRequests: 0,
  slowRequests: 0,
  averageResponseTime: 0,
  responseTimesSum: 0
};

/**
 * Performance tracking middleware
 */
function performanceMiddleware(req, res, next) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Override res.end to add performance headers before response is sent
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;

    // Add performance headers before sending response
    try {
      res.set('X-Response-Time', `${duration}ms`);
      res.set('X-Memory-Delta', `${Math.round(memoryDelta / 1024)}KB`);
    } catch (err) {
      // Headers already sent, ignore
    }

    // Call original end method
    originalEnd.apply(res, args);

    // Track metrics after response is sent
    setImmediate(() => {
      // Update metrics
      metrics.totalRequests++;
      metrics.responseTimesSum += duration;
      metrics.averageResponseTime = metrics.responseTimesSum / metrics.totalRequests;

      // Track slow requests
      if (duration >= THRESHOLDS.SLOW_REQUEST) {
        metrics.slowRequests++;

        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        const slowData = metrics.slowEndpoints.get(endpoint) || {
          count: 0,
          totalTime: 0,
          maxTime: 0,
          avgTime: 0
        };

        slowData.count++;
        slowData.totalTime += duration;
        slowData.maxTime = Math.max(slowData.maxTime, duration);
        slowData.avgTime = slowData.totalTime / slowData.count;

        metrics.slowEndpoints.set(endpoint, slowData);

        // Log slow requests
        if (duration >= THRESHOLDS.VERY_SLOW_REQUEST) {
          logger.error('Very slow request detected', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            statusCode: res.statusCode,
            memoryDelta: `${Math.round(memoryDelta / 1024)}KB`,
            userAgent: req.get('user-agent')
          });
        } else {
          logger.warn('Slow request detected', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            statusCode: res.statusCode
          });
        }
      } else if (duration >= THRESHOLDS.WARNING_REQUEST) {
        logger.debug('Request approaching slow threshold', {
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`
        });
      }
    });
  };

  next();
}

/**
 * Get performance metrics
 */
function getMetrics() {
  return {
    totalRequests: metrics.totalRequests,
    slowRequests: metrics.slowRequests,
    slowRequestsPercentage: metrics.totalRequests > 0
      ? ((metrics.slowRequests / metrics.totalRequests) * 100).toFixed(2)
      : 0,
    averageResponseTime: Math.round(metrics.averageResponseTime),
    slowEndpoints: Array.from(metrics.slowEndpoints.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        avgTime: Math.round(data.avgTime),
        maxTime: data.maxTime
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10), // Top 10 slowest endpoints
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
}

/**
 * Reset performance metrics
 */
function resetMetrics() {
  metrics.slowEndpoints.clear();
  metrics.totalRequests = 0;
  metrics.slowRequests = 0;
  metrics.averageResponseTime = 0;
  metrics.responseTimesSum = 0;
}

/**
 * Log performance summary
 */
function logPerformanceSummary() {
  const summary = getMetrics();

  logger.info('Performance Summary', {
    totalRequests: summary.totalRequests,
    slowRequests: summary.slowRequests,
    slowRequestsPercentage: `${summary.slowRequestsPercentage}%`,
    averageResponseTime: `${summary.averageResponseTime}ms`,
    topSlowEndpoints: summary.slowEndpoints.slice(0, 5)
  });
}

module.exports = {
  performanceMiddleware,
  getMetrics,
  resetMetrics,
  logPerformanceSummary,
  THRESHOLDS
};
