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
  getDemandStats,
} = require('../controllers/demands.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter } = require('../middlewares/rateLimiters');
const {
  validateDemandCreation,
  validateId,
  validatePagination,
} = require('../middlewares/validate');
const { requireEmailVerified } = require('../controllers/emailVerification.controller');
const { cacheList, cacheSearch, cacheStatic } = require('../middlewares/cache');

/**
 * @swagger
 * /demands:
 *   get:
 *     summary: Get all ride demands
 *     description: Retrieve paginated list of active ride demands/requests
 *     tags: [Demands]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Demands retrieved successfully
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
 *                     $ref: '#/components/schemas/Demand'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', cacheList, validatePagination, getDemands);

/**
 * @swagger
 * /demands/search:
 *   get:
 *     summary: Search ride demands
 *     description: Search demands by origin, destination, date, and other criteria
 *     tags: [Demands]
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
 *         description: Desired departure date
 *       - in: query
 *         name: seats
 *         schema:
 *           type: integer
 *         description: Number of seats needed
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
 *                     $ref: '#/components/schemas/Demand'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/search', cacheSearch, validatePagination, searchDemands);

/**
 * @swagger
 * /demands/categories:
 *   get:
 *     summary: Get demand categories
 *     description: Retrieve list of available ride demand categories
 *     tags: [Demands]
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
 */
router.get('/categories', cacheStatic, getCategories);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

/**
 * @swagger
 * /demands/{id}:
 *   get:
 *     summary: Get demand by ID
 *     description: Retrieve detailed information about a specific ride demand (authentication required)
 *     tags: [Demands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Demand retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Demand'
 *       404:
 *         description: Demand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateId, getDemandById);

/**
 * @swagger
 * /demands:
 *   post:
 *     summary: Create new ride demand
 *     description: Create a new ride demand/request (requires email verification)
 *     tags: [Demands]
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
 *               - seats
 *             properties:
 *               origin:
 *                 type: string
 *                 example: أربيل
 *               destination:
 *                 type: string
 *                 example: السليمانية
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-11-15T08:00:00Z
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 example: 2
 *               maxPrice:
 *                 type: number
 *                 minimum: 0
 *                 example: 40000
 *               notes:
 *                 type: string
 *                 example: أفضل السفر صباحاً
 *     responses:
 *       201:
 *         description: Demand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Demand'
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
router.post('/', moderateLimiter, requireEmailVerified, validateDemandCreation, createDemand);

/**
 * @swagger
 * /demands/{id}:
 *   put:
 *     summary: Update ride demand
 *     description: Update an existing ride demand (owner only)
 *     tags: [Demands]
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
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *               maxPrice:
 *                 type: number
 *                 minimum: 0
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Demand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Demand'
 *       403:
 *         description: Forbidden - Not demand owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Demand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', moderateLimiter, updateDemand);

/**
 * @swagger
 * /demands/{id}/deactivate:
 *   put:
 *     summary: Deactivate ride demand
 *     description: Deactivate or cancel a ride demand (owner only)
 *     tags: [Demands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Demand deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Forbidden - Not demand owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Demand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/deactivate', moderateLimiter, deactivateDemand);

/**
 * @swagger
 * /demands/{id}:
 *   delete:
 *     summary: Delete ride demand
 *     description: Permanently delete a ride demand (owner only)
 *     tags: [Demands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Demand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Forbidden - Not demand owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Demand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', moderateLimiter, async (req, res, next) => {
  try {
    const pool = req.app.get('dbPool');
    const userId = req.user.id;
    const demandId = req.params.id;

    // Check if demand exists and belongs to user
    const checkQuery = 'SELECT passenger_id FROM demands WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [demandId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    if (checkResult.rows[0].passenger_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا الطلب',
      });
    }

    // Delete the demand
    const deleteQuery = 'DELETE FROM demands WHERE id = $1';
    await pool.query(deleteQuery, [demandId]);

    res.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /demands/user/{userId}:
 *   get:
 *     summary: Get user's demands
 *     description: Retrieve all demands created by a specific user
 *     tags: [Demands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: User demands retrieved successfully
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
 *                     $ref: '#/components/schemas/Demand'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/user/:userId', validateId, validatePagination, getUserDemands);

/**
 * @swagger
 * /demands/my/demands:
 *   get:
 *     summary: Get my demands
 *     description: Retrieve all demands created by authenticated user
 *     tags: [Demands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: My demands retrieved successfully
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
 *                     $ref: '#/components/schemas/Demand'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/my/demands', validatePagination, getUserDemands);

/**
 * @swagger
 * /demands/admin/stats:
 *   get:
 *     summary: Get demand statistics (Admin only)
 *     description: Retrieve platform-wide demand statistics - Admin access required
 *     tags: [Demands]
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
 *                     totalDemands:
 *                       type: integer
 *                       example: 800
 *                     activeDemands:
 *                       type: integer
 *                       example: 150
 *                     completedDemands:
 *                       type: integer
 *                       example: 650
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/admin/stats', requireAdmin, getDemandStats);

module.exports = router;
