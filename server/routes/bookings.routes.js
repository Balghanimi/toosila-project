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
  getUserBookingStats,
  getPendingCount
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

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a booking for a ride offer
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *               - seats
 *             properties:
 *               offerId:
 *                 type: string
 *                 format: uuid
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 example: 2
 *               message:
 *                 type: string
 *                 example: أريد الحجز من فضلك
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 */
router.post('/', moderateLimiter, validateBookingCreation, createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     description: Retrieve paginated list of all bookings for authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', validatePagination, getBookings);

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get booking statistics
 *     description: Retrieve booking statistics for authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', getBookingStats);

/**
 * @swagger
 * /bookings/my/stats:
 *   get:
 *     summary: Get my booking statistics
 *     description: Get detailed booking statistics for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
router.get('/my/stats', getUserBookingStats);

/**
 * @swagger
 * /bookings/my/pending-count:
 *   get:
 *     summary: Get pending bookings count
 *     description: Get count of pending bookings for authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending count retrieved successfully
 */
router.get('/my/pending-count', getPendingCount);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: Retrieve specific booking details
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 */
router.get('/:id', validateId, getBookingById);

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     description: Accept or reject a booking (driver only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Booking status updated
 */
router.put('/:id/status', moderateLimiter, updateBookingStatus);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel booking
 *     description: Cancel a booking (passenger or driver)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.put('/:id/cancel', moderateLimiter, cancelBooking);

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get user bookings
 *     description: Retrieve bookings for a specific user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 */
router.get('/user/:userId', validateId, validatePagination, getUserBookings);

/**
 * @swagger
 * /bookings/my/bookings:
 *   get:
 *     summary: Get my bookings
 *     description: Retrieve all bookings created by authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: My bookings retrieved successfully
 */
router.get('/my/bookings', validatePagination, getUserBookings);

/**
 * @swagger
 * /bookings/my/offers:
 *   get:
 *     summary: Get bookings for my offers
 *     description: Retrieve all bookings for offers created by authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Offer bookings retrieved successfully
 */
router.get('/my/offers', validatePagination, getOfferBookings);

/**
 * @swagger
 * /bookings/admin/stats:
 *   get:
 *     summary: Get admin booking statistics
 *     description: Retrieve platform-wide booking statistics (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully
 */
router.get('/admin/stats', requireAdmin, getBookingStats);

module.exports = router;

