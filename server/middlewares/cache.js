/**
 * Cache Middleware
 *
 * Provides request-level caching for API endpoints to reduce database load
 * and improve response times.
 *
 * Features:
 * - Automatic cache key generation based on URL and query params
 * - User-specific caching (includes user ID in cache key)
 * - Configurable TTL per endpoint
 * - Cache invalidation helpers
 * - Automatic fallback if Redis is unavailable
 */

const { cache, TTL, KEY_PREFIX } = require('../config/redis');

/**
 * Generate cache key from request
 * @param {object} req - Express request object
 * @param {string} prefix - Cache key prefix
 * @returns {string} - Cache key
 */
function generateCacheKey(req, prefix = '') {
  const baseUrl = req.baseUrl || '';
  const path = req.path || '';
  const query = JSON.stringify(req.query || {});
  const userId = req.user?.id || 'anonymous';

  return `${prefix}${baseUrl}${path}:${userId}:${query}`;
}

/**
 * Cache middleware factory
 * Creates a middleware that caches GET requests
 *
 * @param {object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds (default: 5 minutes)
 * @param {string} options.prefix - Cache key prefix (default: 'api:')
 * @param {boolean} options.includeUser - Include user ID in cache key (default: true)
 * @param {function} options.keyGenerator - Custom key generator function
 * @returns {function} - Express middleware
 */
function cacheMiddleware(options = {}) {
  const {
    ttl = TTL.MEDIUM,
    prefix = 'api:',
    includeUser = true,
    keyGenerator = null
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if cache is not available
    if (!cache.isAvailable()) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : includeUser
          ? generateCacheKey(req, prefix)
          : `${prefix}${req.baseUrl || ''}${req.path}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        // Cache hit - return cached data
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss - store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error('Cache: Error caching response:', err.message);
          });
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next(); // Continue without caching
    }
  };
}

/**
 * Cache middleware for list endpoints (offers, demands, etc.)
 * Uses LIST prefix and medium TTL
 */
const cacheList = cacheMiddleware({
  ttl: TTL.MEDIUM,
  prefix: KEY_PREFIX.LIST
});

/**
 * Cache middleware for search endpoints
 * Uses SEARCH prefix and short TTL (data changes frequently)
 */
const cacheSearch = cacheMiddleware({
  ttl: TTL.SHORT,
  prefix: KEY_PREFIX.SEARCH
});

/**
 * Cache middleware for user data
 * Uses USER prefix and medium TTL
 */
const cacheUser = cacheMiddleware({
  ttl: TTL.MEDIUM,
  prefix: KEY_PREFIX.USER,
  includeUser: true
});

/**
 * Cache middleware for ratings
 * Uses RATING prefix and long TTL (ratings don't change often)
 */
const cacheRatings = cacheMiddleware({
  ttl: TTL.LONG,
  prefix: KEY_PREFIX.RATING
});

/**
 * Cache middleware for stats
 * Uses STATS prefix and medium TTL
 */
const cacheStats = cacheMiddleware({
  ttl: TTL.MEDIUM,
  prefix: KEY_PREFIX.STATS
});

/**
 * Cache middleware for static data (cities, etc.)
 * Uses CITY prefix and very long TTL
 */
const cacheStatic = cacheMiddleware({
  ttl: TTL.VERY_LONG,
  prefix: KEY_PREFIX.CITY,
  includeUser: false // Static data is same for all users
});

/**
 * Cache invalidation helpers
 */

/**
 * Invalidate cache for offers
 * Call this when offers are created/updated/deleted
 */
async function invalidateOfferCache() {
  try {
    const patterns = [
      `${KEY_PREFIX.LIST}*offers*`,
      `${KEY_PREFIX.SEARCH}*offers*`,
      `${KEY_PREFIX.OFFER}*`,
      `${KEY_PREFIX.STATS}*offers*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    if (totalDeleted > 0) {
      console.log(`Cache: Invalidated ${totalDeleted} offer cache entries`);
    }
  } catch (error) {
    console.error('Cache: Error invalidating offer cache:', error.message);
  }
}

/**
 * Invalidate cache for demands
 * Call this when demands are created/updated/deleted
 */
async function invalidateDemandCache() {
  try {
    const patterns = [
      `${KEY_PREFIX.LIST}*demands*`,
      `${KEY_PREFIX.SEARCH}*demands*`,
      `${KEY_PREFIX.DEMAND}*`,
      `${KEY_PREFIX.STATS}*demands*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    if (totalDeleted > 0) {
      console.log(`Cache: Invalidated ${totalDeleted} demand cache entries`);
    }
  } catch (error) {
    console.error('Cache: Error invalidating demand cache:', error.message);
  }
}

/**
 * Invalidate cache for bookings
 * Call this when bookings are created/updated/deleted
 */
async function invalidateBookingCache() {
  try {
    const patterns = [
      `${KEY_PREFIX.LIST}*bookings*`,
      `${KEY_PREFIX.BOOKING}*`,
      `${KEY_PREFIX.STATS}*bookings*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    if (totalDeleted > 0) {
      console.log(`Cache: Invalidated ${totalDeleted} booking cache entries`);
    }
  } catch (error) {
    console.error('Cache: Error invalidating booking cache:', error.message);
  }
}

/**
 * Invalidate cache for ratings
 * Call this when ratings are created/updated
 */
async function invalidateRatingCache(userId = null) {
  try {
    const patterns = userId
      ? [`${KEY_PREFIX.RATING}*${userId}*`, `${KEY_PREFIX.USER}*${userId}*`, `${KEY_PREFIX.STATS}*`]
      : [`${KEY_PREFIX.RATING}*`, `${KEY_PREFIX.STATS}*ratings*`];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    if (totalDeleted > 0) {
      console.log(`Cache: Invalidated ${totalDeleted} rating cache entries`);
    }
  } catch (error) {
    console.error('Cache: Error invalidating rating cache:', error.message);
  }
}

/**
 * Invalidate cache for user stats
 * Call this when user data changes (bookings, ratings, etc.)
 */
async function invalidateUserStats(userId) {
  try {
    const patterns = [
      `${KEY_PREFIX.USER}*${userId}*`,
      `${KEY_PREFIX.STATS}*${userId}*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    if (totalDeleted > 0) {
      console.log(`Cache: Invalidated ${totalDeleted} user stats entries for user ${userId}`);
    }
  } catch (error) {
    console.error('Cache: Error invalidating user stats:', error.message);
  }
}

/**
 * Invalidate all cache
 * Use with caution - only for admin/maintenance operations
 */
async function invalidateAllCache() {
  try {
    await cache.flush();
    console.log('Cache: All cache invalidated');
  } catch (error) {
    console.error('Cache: Error invalidating all cache:', error.message);
  }
}

module.exports = {
  // Middleware functions
  cacheMiddleware,
  cacheList,
  cacheSearch,
  cacheUser,
  cacheRatings,
  cacheStats,
  cacheStatic,

  // Invalidation functions
  invalidateOfferCache,
  invalidateDemandCache,
  invalidateBookingCache,
  invalidateRatingCache,
  invalidateUserStats,
  invalidateAllCache,

  // Utility functions
  generateCacheKey
};
