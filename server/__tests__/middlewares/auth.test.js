/**
 * Unit Tests for Auth Middleware
 * Tests JWT authentication and authorization middleware
 */

const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const {
  authenticateToken,
  authenticateRefreshToken,
  requireAdmin,
  requireOwnership,
  generateAccessToken,
  generateRefreshToken
} = require('../../middlewares/auth');

// Mock config
jest.mock('../../config/env', () => ({
  JWT_SECRET: 'test-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_EXPIRES_IN: '1h',
  JWT_REFRESH_EXPIRES_IN: '7d'
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
      params: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user'
      };

      const token = jwt.sign(mockUser, config.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(1);
      expect(req.user.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access token required',
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        config.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      req.headers.authorization = `Bearer ${expiredToken}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authenticateRefreshToken', () => {
    it('should authenticate valid refresh token', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com'
      };

      const refreshToken = jwt.sign(mockUser, config.JWT_REFRESH_SECRET);
      req.body.refreshToken = refreshToken;

      authenticateRefreshToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(1);
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without refresh token', () => {
      authenticateRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Refresh token required',
        message: expect.any(String)
      });
    });

    it('should reject invalid refresh token', () => {
      req.body.refreshToken = 'invalid-token';

      authenticateRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin users', () => {
      req.user = {
        id: 1,
        role: 'admin'
      };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject non-admin users', () => {
      req.user = {
        id: 1,
        role: 'user'
      };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests without user', () => {
      req.user = null;

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireOwnership', () => {
    it('should allow resource owner by default user_id param', () => {
      req.user = { id: 1 };
      req.params.user_id = '1';

      const middleware = requireOwnership();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow resource owner with custom field', () => {
      req.user = { id: 5 };
      req.params.customId = '5';

      const middleware = requireOwnership('customId');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should check body for resource user ID', () => {
      req.user = { id: 3 };
      req.body.user_id = 3;

      const middleware = requireOwnership();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject non-owner', () => {
      req.user = { id: 1 };
      req.params.user_id = '2';

      const middleware = requireOwnership();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: expect.any(String)
      });
    });

    it('should reject request without user', () => {
      req.user = null;
      req.params.user_id = '1';

      const middleware = requireOwnership();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate valid access token with user data', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        isDriver: true,
        role: 'user'
      };

      const token = generateAccessToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, config.JWT_SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.name).toBe('Test User');
      expect(decoded.isDriver).toBe(true);
      expect(decoded.role).toBe('user');
    });

    it('should handle user with is_driver field', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        is_driver: true,
        role: 'user'
      };

      const token = generateAccessToken(user);
      const decoded = jwt.verify(token, config.JWT_SECRET);

      expect(decoded.isDriver).toBe(true);
    });

    it('should default isDriver to false if not provided', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      const token = generateAccessToken(user);
      const decoded = jwt.verify(token, config.JWT_SECRET);

      expect(decoded.isDriver).toBe(false);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid refresh token', () => {
      const user = {
        id: 1,
        email: 'test@example.com'
      };

      const token = generateRefreshToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should not include sensitive data in refresh token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'should-not-be-included',
        name: 'Test User'
      };

      const token = generateRefreshToken(user);
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);

      expect(decoded.password_hash).toBeUndefined();
      expect(decoded.name).toBeUndefined();
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });
  });
});
