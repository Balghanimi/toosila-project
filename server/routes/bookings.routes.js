const express = require('express');
const router = express.Router();

// Import controllers
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
  getOfferBookings,
  getBookingStats,
  getUserBookingStats
} = require('../controllers/bookings.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter } = require('../middlewares/rateLimiters');
const {
  validateBookingCreation,
  validateId,
  validatePagination
} = require('../middlewares/validate');

// All routes require authentication
router.use(authenticateToken);

// Booking management routes
router.post('/', moderateLimiter, validateBookingCreation, createBooking);
router.get('/', validatePagination, getBookings);
router.get('/stats', getBookingStats);
router.get('/my/stats', getUserBookingStats);
router.get('/:id', validateId, getBookingById);
router.put('/:id/status', moderateLimiter, updateBookingStatus);
router.put('/:id/cancel', moderateLimiter, cancelBooking);

// User bookings routes
router.get('/user/:userId', validateId, validatePagination, getUserBookings);
router.get('/my/bookings', validatePagination, getUserBookings);
router.get('/my/offers', validatePagination, getOfferBookings);

// Admin routes
router.get('/admin/stats', requireAdmin, getBookingStats);

module.exports = router;

