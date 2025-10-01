const express = require('express');
const router = express.Router();

// Import controllers
const {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deactivateOffer,
  getUserOffers,
  searchOffers,
  getCategories,
  getOfferStats
} = require('../controllers/offers.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter, uploadLimiter } = require('../middlewares/rateLimiters');
const {
  validateOfferCreation,
  validateOfferUpdate,
  validateId,
  validatePagination
} = require('../middlewares/validate');

// Public routes
router.get('/', validatePagination, getOffers);
router.get('/search', validatePagination, searchOffers);
router.get('/categories', getCategories);
router.get('/:id', validateId, getOfferById);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// Offer management routes
router.post('/', moderateLimiter, validateOfferCreation, createOffer);
router.put('/:id', moderateLimiter, validateOfferUpdate, updateOffer);
router.put('/:id/deactivate', moderateLimiter, deactivateOffer);

// User offers routes
router.get('/user/:userId', validateId, validatePagination, getUserOffers);
router.get('/my/offers', validatePagination, getUserOffers);

// Admin routes
router.get('/admin/stats', requireAdmin, getOfferStats);

module.exports = router;

