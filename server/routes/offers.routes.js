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
const { authenticateToken, optionalAuth, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter, uploadLimiter } = require('../middlewares/rateLimiters');
const {
  validateOfferCreation,
  validateOfferUpdate,
  validateId,
  validateUserId,
  validatePagination
} = require('../middlewares/validate');
const { requireEmailVerified } = require('../controllers/emailVerification.controller');
const { cacheList, cacheSearch, cacheStatic } = require('../middlewares/cache');

/**
 * @swagger
 * /offers:
 *   get:
 *     summary: Get all ride offers
 *     description: Retrieve paginated list of active ride offers
 *     tags: [Offers]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', optionalAuth, cacheList, validatePagination, getOffers);

/**
 * @swagger
 * /offers/search:
 *   get:
 *     summary: Search ride offers
 *     description: Search offers by origin, destination, date, and other criteria
 *     tags: [Offers]
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Starting city
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Destination city
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date
 *       - in: query
 *         name: seats
 *         schema:
 *           type: integer
 *         description: Minimum available seats
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per seat
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/search', cacheSearch, validatePagination, searchOffers);

/**
 * @swagger
 * /offers/categories:
 *   get:
 *     summary: Get offer categories
 *     description: Retrieve list of available ride offer categories/types
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['اقتصادية', 'مريحة', 'فاخرة']
 */
router.get('/categories', cacheStatic, getCategories);

/**
 * @swagger
 * /offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     description: Retrieve detailed information about a specific ride offer
 *     tags: [Offers]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Offer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', optionalAuth, cacheList, validateId, getOfferById);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

/**
 * @swagger
 * /offers:
 *   post:
 *     summary: Create new ride offer
 *     description: Create a new ride offer (drivers only, requires email verification)
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - departureTime
 *               - availableSeats
 *               - pricePerSeat
 *               - vehicleType
 *             properties:
 *               origin:
 *                 type: string
 *                 example: بغداد
 *               destination:
 *                 type: string
 *                 example: البصرة
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-11-15T08:00:00Z
 *               availableSeats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 example: 3
 *               pricePerSeat:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               vehicleType:
 *                 type: string
 *                 example: سيدان
 *               vehicleModel:
 *                 type: string
 *                 example: Toyota Camry 2020
 *               notes:
 *                 type: string
 *                 example: رحلة مريحة مع مكيف
 *     responses:
 *       201:
 *         description: Offer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Offer'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Email verification required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', moderateLimiter, requireEmailVerified, validateOfferCreation, createOffer);

/**
 * @swagger
 * /offers/{id}:
 *   put:
 *     summary: Update ride offer
 *     description: Update an existing ride offer (owner only)
 *     tags: [Offers]
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
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               availableSeats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *               pricePerSeat:
 *                 type: number
 *                 minimum: 0
 *               vehicleType:
 *                 type: string
 *               vehicleModel:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Offer'
 *       403:
 *         description: Forbidden - Not offer owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', moderateLimiter, validateOfferUpdate, updateOffer);

/**
 * @swagger
 * /offers/{id}/deactivate:
 *   put:
 *     summary: Deactivate ride offer
 *     description: Deactivate or cancel a ride offer (owner only)
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Offer deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Forbidden - Not offer owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/deactivate', moderateLimiter, deactivateOffer);

/**
 * @swagger
 * /offers/user/{userId}:
 *   get:
 *     summary: Get user's offers
 *     description: Retrieve all offers created by a specific user
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: User offers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/user/:userId', validateUserId, validatePagination, getUserOffers);

/**
 * @swagger
 * /offers/my/offers:
 *   get:
 *     summary: Get my offers
 *     description: Retrieve all offers created by authenticated user
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: My offers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/my/offers', validatePagination, getUserOffers);

/**
 * @swagger
 * /offers/admin/stats:
 *   get:
 *     summary: Get offer statistics (Admin only)
 *     description: Retrieve platform-wide offer statistics - Admin access required
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOffers:
 *                       type: integer
 *                       example: 1500
 *                     activeOffers:
 *                       type: integer
 *                       example: 300
 *                     completedOffers:
 *                       type: integer
 *                       example: 1200
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/admin/stats', requireAdmin, getOfferStats);

module.exports = router;
