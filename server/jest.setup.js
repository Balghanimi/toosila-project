// Jest setup file - runs before all tests
// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Suppress console logs during tests (optional)
if (process.env.LOG_LEVEL === 'error') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error and debug for troubleshooting
    error: console.error,
    debug: console.debug,
  };
}
