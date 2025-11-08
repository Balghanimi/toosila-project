/**
 * Cache Control Middleware
 *
 * Adds appropriate cache headers to responses based on the type of content
 */

/**
 * No cache - for dynamic/private data (user profiles, auth, etc.)
 */
const noCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};

/**
 * Short cache - for semi-dynamic data (5 minutes)
 */
const shortCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
    'Vary': 'Accept-Encoding'
  });
  next();
};

/**
 * Medium cache - for data that changes occasionally (1 hour)
 */
const mediumCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1 hour
    'Vary': 'Accept-Encoding'
  });
  next();
};

/**
 * Long cache - for static/rarely changing data (1 day)
 */
const longCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 1 day
    'Vary': 'Accept-Encoding'
  });
  next();
};

/**
 * ETag support for conditional requests
 */
const etag = (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    if (data && typeof data === 'object') {
      const etag = require('crypto')
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');

      res.set('ETag', `"${etag}"`);

      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${etag}"`) {
        return res.status(304).end();
      }
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  noCache,
  shortCache,
  mediumCache,
  longCache,
  etag
};
