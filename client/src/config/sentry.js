import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for frontend error tracking
 *
 * Setup Instructions:
 * 1. Sign up for a free Sentry account at https://sentry.io/signup/
 * 2. Create a new React project (separate from backend)
 * 3. Copy the DSN (Data Source Name) from the project settings
 * 4. Add to your .env file: REACT_APP_SENTRY_DSN=your_dsn_here
 * 5. Optionally set REACT_APP_SENTRY_ENVIRONMENT (defaults to production)
 */

export const initializeSentry = () => {
  // Only initialize if DSN is provided
  if (!process.env.REACT_APP_SENTRY_DSN) {
    console.warn('REACT_APP_SENTRY_DSN not found. Sentry error tracking is disabled.');
    console.warn('To enable Sentry:');
    console.warn('1. Sign up at https://sentry.io');
    console.warn('2. Create a React project');
    console.warn('3. Add REACT_APP_SENTRY_DSN to your .env file');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

      // Set sample rate for performance monitoring
      // 1.0 = 100% of transactions, 0.1 = 10% of transactions
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Capture Replay for Session Replay
      // This records user sessions to help debug issues
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      integrations: [
        // Browser tracing for performance monitoring
        Sentry.browserTracingIntegration(),

        // Session Replay
        Sentry.replayIntegration({
          maskAllText: true, // Mask all text for privacy
          blockAllMedia: true, // Block all media for privacy
        }),

        // React-specific integrations
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
        }),
      ],

      // Filter out sensitive data before sending to Sentry
      beforeSend(event, hint) {
        // Remove any sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data) {
              const sensitiveFields = ['password', 'token', 'authorization'];
              sensitiveFields.forEach(field => {
                if (breadcrumb.data[field]) {
                  breadcrumb.data[field] = '[REDACTED]';
                }
              });
            }
            return breadcrumb;
          });
        }

        // Don't send events for network errors in development
        if (process.env.NODE_ENV === 'development' && hint?.originalException?.message?.includes('Network')) {
          return null;
        }

        return event;
      },

      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Network errors that aren't actionable
        'NetworkError',
        'Network request failed',
        // Common React errors that aren't bugs
        'ResizeObserver loop limit exceeded',
      ],

      // Don't send errors in development or test
      enabled: process.env.NODE_ENV === 'production',
    });

    console.log('✓ Sentry initialized for React application');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error.message);
  }
};

/**
 * Manually capture an exception with additional context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context (user, tags, etc.)
 */
export const captureException = (error, context = {}) => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
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

    // Set component name
    if (context.component) {
      scope.setTag('component', context.component);
    }

    Sentry.captureException(error);
  });
};

/**
 * Set user context for all future error reports
 * Call this after user login
 * @param {Object} user - User object with id, email, role
 */
export const setUser = (user) => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    return;
  }

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } else {
    // Clear user on logout
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for tracking user actions
 * @param {string} message - Description of the action
 * @param {string} category - Category (navigation, user, api, etc.)
 * @param {Object} data - Additional data
 */
export const addBreadcrumb = (message, category = 'user', data = {}) => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
};

/**
 * Capture a message (not an error)
 * @param {string} message - The message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 */
export const captureMessage = (message, level = 'info') => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    return;
  }

  Sentry.captureMessage(message, level);
};

export default Sentry;
