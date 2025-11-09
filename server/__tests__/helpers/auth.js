/**
 * Auth Test Helpers
 * Utilities for authentication testing including token generation and mocking
 */

const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const { generateAccessToken, generateRefreshToken } = require('../../middlewares/auth');

/**
 * Generate a test JWT token for a user
 */
const generateTestToken = (user) => {
  return generateAccessToken(user);
};

/**
 * Generate a test refresh token
 */
const generateTestRefreshToken = (user) => {
  return generateRefreshToken(user);
};

/**
 * Create a mock user object for testing
 */
const createMockUser = (overrides = {}) => {
  const defaultUser = {
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
    isDriver: false,
    role: 'user'
  };

  return { ...defaultUser, ...overrides };
};

/**
 * Create a mock driver object for testing
 */
const createMockDriver = (overrides = {}) => {
  return createMockUser({
    isDriver: true,
    name: 'Test Driver',
    ...overrides
  });
};

/**
 * Create a mock admin object for testing
 */
const createMockAdmin = (overrides = {}) => {
  return createMockUser({
    role: 'admin',
    name: 'Test Admin',
    ...overrides
  });
};

/**
 * Create an expired JWT token for testing
 */
const generateExpiredToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isDriver: user.isDriver || false,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: '-1h' } // Expired 1 hour ago
  );
};

/**
 * Create an invalid JWT token for testing
 */
const generateInvalidToken = () => {
  return jwt.sign(
    { id: 1, email: 'test@test.com' },
    'wrong-secret-key',
    { expiresIn: '1h' }
  );
};

/**
 * Create authorization header for testing
 */
const createAuthHeader = (token) => {
  return `Bearer ${token}`;
};

/**
 * Mock authenticated request object
 */
const createAuthenticatedRequest = (user, overrides = {}) => {
  const token = generateTestToken(user);

  return {
    user,
    headers: {
      authorization: createAuthHeader(token)
    },
    body: {},
    params: {},
    query: {},
    ...overrides
  };
};

/**
 * Mock unauthenticated request object
 */
const createUnauthenticatedRequest = (overrides = {}) => {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides
  };
};

/**
 * Mock response object for controller testing
 */
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    data: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };

  res.status.mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });

  res.json.mockImplementation((data) => {
    res.data = data;
    return res;
  });

  return res;
};

/**
 * Mock next function for middleware testing
 */
const createMockNext = () => {
  return jest.fn();
};

/**
 * Decode a JWT token without verification (for testing)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Verify a JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Create a complete mock request/response/next setup
 */
const createMockExpressContext = (user = null, reqOverrides = {}) => {
  const req = user
    ? createAuthenticatedRequest(user, reqOverrides)
    : createUnauthenticatedRequest(reqOverrides);

  const res = createMockResponse();
  const next = createMockNext();

  return { req, res, next };
};

module.exports = {
  generateTestToken,
  generateTestRefreshToken,
  createMockUser,
  createMockDriver,
  createMockAdmin,
  generateExpiredToken,
  generateInvalidToken,
  createAuthHeader,
  createAuthenticatedRequest,
  createUnauthenticatedRequest,
  createMockResponse,
  createMockNext,
  decodeToken,
  verifyToken,
  createMockExpressContext
};
