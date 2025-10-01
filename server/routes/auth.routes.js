const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getUserStats,
  getAllUsers,
  getUserById,
  deactivateUser
} = require('../controllers/auth.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiters');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateId,
  validatePagination
} = require('../middlewares/validate');

// Public routes
router.post('/register', authLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUserUpdate, updateProfile);
router.put('/change-password', passwordResetLimiter, changePassword);
router.get('/stats', getUserStats);

// Admin routes
router.get('/users', requireAdmin, validatePagination, getAllUsers);
router.get('/users/:id', requireAdmin, validateId, getUserById);
router.put('/users/:id/deactivate', requireAdmin, validateId, deactivateUser);

module.exports = router;

