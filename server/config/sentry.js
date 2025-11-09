const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const config = require('./env');

/**
 * Initialize Sentry for backend error tracking
 *
 * Setup Instructions:
 * 1. Sign up for a free Sentry account at https://sentry.io/signup/
 * 2. Create a new Node.js project
 * 3. Copy the DSN (Data Source Name) from the project settings
 * 4. Add to your .env file: SENTRY_DSN=your_dsn_here
 * 5. Optionally set SENTRY_ENVIRONMENT (defaults to NODE_ENV)
 */

const initializeSentry = (app) => {
  // Only initialize if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not found. Sentry error tracking is disabled.');
    console.warn('To enable Sentry:');
    console.warn('1. Sign up at https://sentry.io');
    console.warn('2. Create a Node.js project');
    console.warn('3. Add SENTRY_DSN to your .env file');
    return null;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || config.NODE_ENV,

      // Set sample rate for performance monitoring
      // 1.0 = 100% of transactions, 0.1 = 10% of transactions
      tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Set sampling rate for profiling
      profilesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Integrations
      integrations: [
        // Performance profiling
        nodeProfilingIntegration(),
      ],

      // Filter out sensitive data before sending to Sentry
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }

        // Remove sensitive data from request body
        if (event.request?.data) {
          const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

          sensitiveFields.forEach(field => {
            if (data[field]) {
              data[field] = '[REDACTED]';
            }
          });

          event.request.data = data;
        }

        return event;
      },

      // Don't report errors in development (optional)
      enabled: config.NODE_ENV !== 'test',
    });

    // The Sentry request handler must be the first middleware on the app
    if (app) {
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.tracingHandler());
    }

    console.log(`✓ Sentry initialized for ${config.NODE_ENV} environment`);
    return Sentry;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error.message);
    return null;
  }
};

/**
 * Add Sentry error handler middleware
 * This should be added BEFORE other error handlers but AFTER all routes
 */
const sentryErrorHandler = () => {
  if (!process.env.SENTRY_DSN) {
    // Return a no-op middleware if Sentry is not configured
    return (err, req, res, next) => next(err);
  }

  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status code >= 500
      // Don't send client errors (4xx) to Sentry by default
      if (error.status >= 500 || error.statusCode >= 500) {
        return true;
      }
      return false;
    },
  });
};

/**
 * Manually capture an exception with additional context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context (user, tags, etc.)
 */
const captureException = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.withScope((scope) => {
    // Add user context
    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        role: context.user.role,
      });
    }

    // Add tags for filtering
    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }

    // Add extra context
    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    // Set transaction name
    if (context.transaction) {
      scope.setTransactionName(context.transaction);
    }

    Sentry.captureException(error);
  });
};

/**
 * Manually capture a message
 * @param {string} message - The message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 * @param {Object} context - Additional context
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context.user) {
      scope.setUser(context.user);
    }
    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }
    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    Sentry.captureMessage(message, level);
  });
};

module.exports = {
  initializeSentry,
  sentryErrorHandler,
  captureException,
  captureMessage,
  Sentry,
};
