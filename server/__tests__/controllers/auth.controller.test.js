/**
 * Unit Tests for Auth Controller
 * Comprehensive test coverage for all authentication endpoints
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updateEmail,
  deleteAccount,
  getUserStats,
  getAllUsers,
  getUserById,
  deactivateUser
} = require('../../controllers/auth.controller');

const User = require('../../models/users.model');
const { generateAccessToken } = require('../../middlewares/auth');
const { sendVerificationEmail } = require('../../utils/emailService');

// Mock dependencies
jest.mock('../../models/users.model');
jest.mock('../../middlewares/auth');
jest.mock('../../utils/emailService');
jest.mock('bcrypt');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        isDriver: false,
        languagePreference: 'ar'
      };

      const mockUser = {
        id: 1,
        ...userData,
        toJSON: jest.fn().mockReturnValue({ id: 1, name: userData.name, email: userData.email })
      };

      req.body = userData;
      User.findByEmail = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      User.create = jest.fn().mockResolvedValue(mockUser);
      sendVerificationEmail.mockResolvedValue(true);

      await register(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: expect.objectContaining({
          user: expect.any(Object),
          requiresVerification: true
        })
      });
    });

    it('should reject registration if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'Password123!'
      };

      req.body = userData;
      User.findByEmail = jest.fn().mockResolvedValue({ id: 1, email: userData.email });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'USER_EXISTS',
          message: expect.any(String)
        })
      });
    });

    it('should handle registration errors gracefully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      };

      User.findByEmail = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockRejectedValue(new Error('Hash failed'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'REGISTRATION_FAILED'
        })
      });
    });

    it('should continue registration even if email sending fails', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        id: 1,
        toJSON: jest.fn().mockReturnValue({ id: 1 })
      };

      req.body = userData;
      User.findByEmail = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      User.create = jest.fn().mockResolvedValue(mockUser);
      sendVerificationEmail.mockRejectedValue(new Error('Email failed'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        id: 1,
        email: credentials.email,
        password_hash: 'hashedPassword',
        email_verified: true,
        role: 'user',
        name: 'Test User'
      };

      req.body = credentials;
      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      generateAccessToken.mockReturnValue('mock-token');

      await login(req, res);

      expect(User.findByEmailWithPassword).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password_hash);
      expect(generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          token: 'mock-token',
          user: expect.not.objectContaining({ password_hash: expect.anything() })
        })
      });
    });

    it('should reject login with invalid email', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_CREDENTIALS'
        })
      });
    });

    it('should reject login with invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        email_verified: true
      };

      req.body = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_CREDENTIALS'
        })
      });
    });

    it('should reject login if email not verified', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        email_verified: false,
        role: 'user'
      };

      req.body = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'EMAIL_NOT_VERIFIED',
          requireVerification: true
        })
      });
    });

    it('should allow admin login without email verification', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        password_hash: 'hashedPassword',
        email_verified: false,
        role: 'admin',
        name: 'Admin User'
      };

      req.body = {
        email: 'admin@example.com',
        password: 'Password123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      generateAccessToken.mockReturnValue('admin-token');

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          token: 'admin-token'
        })
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Test User' })
      };

      req.user = { id: 1 };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.any(Object)
        }
      });
    });

    it('should return 404 if user not found', async () => {
      req.user = { id: 999 };
      User.findById = jest.fn().mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'USER_NOT_FOUND'
        })
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        id: 1,
        update: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Updated Name',
          toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Updated Name' })
        })
      };

      req.user = { id: 1 };
      req.body = {
        name: 'Updated Name',
        languagePreference: 'en'
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);

      await updateProfile(req, res);

      expect(mockUser.update).toHaveBeenCalledWith({
        name: 'Updated Name',
        language_preference: 'en'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          user: expect.any(Object)
        })
      });
    });

    it('should return 404 if user not found', async () => {
      req.user = { id: 999 };
      req.body = { name: 'New Name' };

      User.findById = jest.fn().mockResolvedValue(null);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'oldHashedPassword',
        updatePassword: jest.fn().mockResolvedValue(true)
      };

      req.user = { id: 1, email: 'test@example.com' };
      req.body = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('newHashedPassword');

      await changePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.currentPassword, mockUser.password_hash);
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.newPassword, 12);
      expect(mockUser.updatePassword).toHaveBeenCalledWith('newHashedPassword');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String)
      });
    });

    it('should reject password change with wrong current password', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'hashedPassword'
      };

      req.user = { id: 1, email: 'test@example.com' };
      req.body = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_PASSWORD'
        })
      });
    });
  });

  describe('updateEmail', () => {
    it('should update email successfully', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'hashedPassword',
        update: jest.fn().mockResolvedValue({ email: 'newemail@example.com' })
      };

      req.user = { id: 1, email: 'old@example.com' };
      req.body = {
        newEmail: 'newemail@example.com',
        password: 'Password123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      User.findByEmail = jest.fn().mockResolvedValue(null);

      await updateEmail(req, res);

      expect(mockUser.update).toHaveBeenCalledWith({ email: 'newemail@example.com' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: expect.objectContaining({
          email: 'newemail@example.com'
        })
      });
    });

    it('should reject if email already exists', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'hashedPassword'
      };

      req.user = { id: 1, email: 'old@example.com' };
      req.body = {
        newEmail: 'existing@example.com',
        password: 'Password123!'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      User.findByEmail = jest.fn().mockResolvedValue({ id: 2, email: 'existing@example.com' });

      await updateEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'EMAIL_EXISTS'
        })
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully with correct confirmation', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'hashedPassword',
        delete: jest.fn().mockResolvedValue(true)
      };

      req.user = { id: 1, email: 'test@example.com' };
      req.body = {
        password: 'Password123!',
        confirmation: 'DELETE'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      await deleteAccount(req, res);

      expect(mockUser.delete).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String)
      });
    });

    it('should reject deletion without correct confirmation text', async () => {
      req.user = { id: 1, email: 'test@example.com' };
      req.body = {
        password: 'Password123!',
        confirmation: 'WRONG'
      };

      await deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_CONFIRMATION'
        })
      });
    });

    it('should reject deletion with wrong password', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'hashedPassword'
      };

      req.user = { id: 1, email: 'test@example.com' };
      req.body = {
        password: 'WrongPassword',
        confirmation: 'DELETE'
      };

      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics successfully', async () => {
      const mockStats = {
        totalOffers: 10,
        totalBookings: 5,
        averageRating: 4.5
      };

      req.user = { id: 1 };
      User.getStats = jest.fn().mockResolvedValue(mockStats);

      await getUserStats(req, res);

      expect(User.getStats).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: mockStats
        }
      });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users with pagination', async () => {
      const mockResult = {
        users: [
          { id: 1, name: 'User 1', toJSON: () => ({ id: 1, name: 'User 1' }) },
          { id: 2, name: 'User 2', toJSON: () => ({ id: 2, name: 'User 2' }) }
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      req.query = { page: '1', limit: '10' };
      User.findAll = jest.fn().mockResolvedValue(mockResult);

      await getAllUsers(req, res);

      expect(User.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          users: expect.any(Array),
          pagination: expect.any(Object)
        })
      });
    });

    it('should filter users by isDriver', async () => {
      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      req.query = { isDriver: 'true' };
      User.findAll = jest.fn().mockResolvedValue(mockResult);

      await getAllUsers(req, res);

      expect(User.findAll).toHaveBeenCalledWith(1, 10, { isDriver: true });
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Test User' })
      };

      req.params.id = '1';
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.any(Object)
        }
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '999';
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const mockUser = {
        id: 1,
        deactivate: jest.fn().mockResolvedValue(true)
      };

      req.params.id = '1';
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await deactivateUser(req, res);

      expect(mockUser.deactivate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String)
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '999';
      User.findById = jest.fn().mockResolvedValue(null);

      await deactivateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
