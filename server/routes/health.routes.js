const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { getMetrics } = require('../middlewares/metrics');
const logger = require('../config/logger');

/**
 * Comprehensive health check endpoint
 * Returns detailed system health including database, memory, and uptime
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.1.0',
    };

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    health.memory = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      unit: 'MB',
    };

    // Check database connectivity
    try {
      const dbStart = Date.now();
      const dbResult = await pool.query('SELECT NOW()');
      const dbDuration = Date.now() - dbStart;

      health.database = {
        status: 'connected',
        responseTime: `${dbDuration}ms`,
        timestamp: dbResult.rows[0].now,
      };
    } catch (dbError) {
      health.status = 'unhealthy';
      health.database = {
        status: 'disconnected',
        error: dbError.message,
      };
      logger.error('Database health check failed', { error: dbError.message });
    }

    // Get metrics summary
    const metrics = getMetrics();
    health.metrics = {
      totalRequests: metrics.requests.total,
      errorRate: metrics.requests.total > 0
        ? `${((metrics.errors.total / metrics.requests.total) * 100).toFixed(2)}%`
        : '0%',
      averageResponseTime: `${Math.round(metrics.performance.averageResponseTime)}ms`,
    };

    // Check system health indicators
    health.system = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage(),
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Liveness probe - Basic check if application is running
 * Used by orchestrators like Kubernetes to know if app should be restarted
 */
router.get('/liveness', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness probe - Check if application is ready to serve traffic
 * Used by orchestrators to know when to send traffic to the instance
 */
router.get('/readiness', async (req, res) => {
  try {
    // Check if database is ready
    await pool.query('SELECT 1');

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    logger.warn('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'failed',
      },
      error: error.message,
    });
  }
});

/**
 * Detailed metrics endpoint
 * Returns comprehensive application metrics
 * Should be protected in production or only accessible internally
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = getMetrics();

    res.json({
      ...metrics,
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        unit: 'MB',
      },
    });
  } catch (error) {
    logger.error('Metrics endpoint failed', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message,
    });
  }
});

/**
 * Database health check endpoint
 * Detailed database connection pool status
 */
router.get('/database', async (req, res) => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW(), version()');
    const duration = Date.now() - start;

    res.json({
      status: 'connected',
      responseTime: `${duration}ms`,
      currentTime: result.rows[0].now,
      version: result.rows[0].version,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    });
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    res.status(503).json({
      status: 'disconnected',
      error: error.message,
    });
  }
});

module.exports = router;
