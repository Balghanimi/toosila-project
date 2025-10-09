const express = require('express');
const router = express.Router();

// Import controllers
const {
  createDemand,
  getDemands,
  getDemandById,
  updateDemand,
  deactivateDemand,
  getUserDemands,
  searchDemands,
  getCategories,
  getDemandStats
} = require('../controllers/demands.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter } = require('../middlewares/rateLimiters');
const {
  validateDemandCreation,
  validateId,
  validatePagination
} = require('../middlewares/validate');

// Public routes
router.get('/', validatePagination, getDemands);
router.get('/search', validatePagination, searchDemands);
router.get('/categories', getCategories);
router.get('/:id', validateId, getDemandById);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// Demand management routes
router.post('/', moderateLimiter, validateDemandCreation, createDemand);
router.put('/:id', moderateLimiter, updateDemand);
router.put('/:id/deactivate', moderateLimiter, deactivateDemand);

// User demands routes
router.get('/user/:userId', validateId, validatePagination, getUserDemands);
router.get('/my/demands', validatePagination, getUserDemands);

// Admin routes
router.get('/admin/stats', requireAdmin, getDemandStats);

module.exports = router;

