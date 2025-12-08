
const { register } = require('../../controllers/auth.controller');
const AuthService = require('../../services/auth.service');

// Mock dependencies
jest.mock('../../models/users.model');
jest.mock('../../middlewares/auth');
jest.mock('../../utils/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../services/auth.service');
jest.mock('bcrypt');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
        isDriver: false,
        languagePreference: 'ar'
      };

      req.body = userData;

      AuthService.registerUser.mockResolvedValue({
        user: { id: 1, ...userData },
        requiresVerification: true
      });

      await register(req, res, next);

      expect(AuthService.registerUser).toHaveBeenCalledWith(userData);
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
  });
});
