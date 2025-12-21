const express = require('express');
const router = express.Router();

// Import controllers
const {
  createRating,
  getRatings,
  getRatingById,
  updateRating,
  deleteRating,
  getUserRatings,
  getUserAverageRating,
  getTopRatedUsers,
  getRatingStats
} = require('../controllers/ratings.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter } = require('../middlewares/rateLimiters');
const {
  validateRatingCreation,
  validateId,
  validateUserId,
  validatePagination
} = require('../middlewares/validate');

// Public routes
router.get('/', validatePagination, getRatings);
router.get('/top-users', getTopRatedUsers);
router.get('/stats', getRatingStats);
router.get('/user/:userId', validateUserId, validatePagination, getUserRatings);
router.get('/user/:userId/average', validateUserId, getUserAverageRating);
router.get('/:id', validateId, getRatingById);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// Rating management routes
router.post('/', moderateLimiter, validateRatingCreation, createRating);
router.put('/:id', moderateLimiter, updateRating);
router.delete('/:id', moderateLimiter, deleteRating);

// Admin routes
router.get('/admin/stats', requireAdmin, getRatingStats);

module.exports = router;

