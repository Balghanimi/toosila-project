const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

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
  validateIntId,
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

/**
 * @swagger
 * /bookings/{id}/accept:
 *   post:
 *     summary: Accept a booking
 *     description: Driver accepts a booking request
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 */
router.post('/:id/accept', validateIntId, async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const driverId = req.user.id;

    // Start transaction to prevent race conditions
    await pool.query('BEGIN');

    try {
      // التحقق من أن الحجز موجود وللسائق الحالي
      const bookingResult = await pool.query(
        `SELECT b.*, o.id as offer_id, o.seats as offer_seats, o.driver_id,
                o.from_city, o.to_city, o.departure_time, o.price
         FROM bookings b
         JOIN offers o ON b.offer_id = o.id
         WHERE b.id = $1
         FOR UPDATE`, // Lock row for update to prevent concurrent modifications
        [bookingId]
      );

      if (bookingResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'الحجز غير موجود',
        });
      }

      const booking = bookingResult.rows[0];

      if (booking.driver_id !== driverId) {
        await pool.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بتنفيذ هذا الإجراء',
        });
      }

      // ✅ CRITICAL FIX: Check seat availability BEFORE accepting
      const seatsResult = await pool.query(
        `SELECT COALESCE(SUM(seats), 0) as total_booked
         FROM bookings
         WHERE offer_id = $1
         AND status = $2
         AND id != $3`,
        [booking.offer_id, 'confirmed', bookingId]
      );

      const totalBooked = parseInt(seatsResult.rows[0].total_booked) || 0;
      const availableSeats = booking.offer_seats - totalBooked;

      // Validate if enough seats are available
      if (booking.seats > availableSeats) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `عذراً، المقاعد المتاحة: ${availableSeats} فقط. لا يمكن قبول هذا الحجز (طلب ${booking.seats} مقاعد).`,
        });
      }

      // تحديث حالة الحجز إلى confirmed
      await pool.query(
        'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
        ['confirmed', bookingId]
      );

      // إرسال إشعار للراكب
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          booking.passenger_id,
          'booking_accepted',
          'تم قبول حجزك ✅',
          'السائق وافق على طلب الحجز الخاص بك',
          JSON.stringify({
            bookingId: bookingId,
            booking_id: bookingId,
            route: `${booking.from_city} → ${booking.to_city}`,
            date: booking.departure_time,
            price: booking.price,
          }),
        ]
      );

      // Commit transaction
      await pool.query('COMMIT');

      res.json({
        success: true,
        message: 'تم قبول الحجز بنجاح',
      });
    } catch (innerError) {
      // Rollback on any error
      await pool.query('ROLLBACK');
      throw innerError;
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /bookings/{id}/reject:
 *   post:
 *     summary: Reject a booking
 *     description: Driver rejects a booking request
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 */
router.post('/:id/reject', validateIntId, async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const driverId = req.user.id;

    // التحقق من أن الحجز موجود وللسائق الحالي
    const bookingResult = await pool.query(
      `SELECT b.*, o.driver_id, o.from_city, o.to_city, o.departure_time, o.price
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود',
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.driver_id !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتنفيذ هذا الإجراء',
      });
    }

    // تحديث حالة الحجز إلى rejected
    await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
      ['rejected', bookingId]
    );

    // إرسال إشعار للراكب
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        booking.passenger_id,
        'booking_rejected',
        'تم رفض حجزك ❌',
        'السائق رفض طلب الحجز الخاص بك',
        JSON.stringify({
          bookingId: bookingId,
          booking_id: bookingId,
          route: `${booking.from_city} → ${booking.to_city}`,
          date: booking.departure_date,
          price: booking.price,
        }),
      ]
    );

    res.json({
      success: true,
      message: 'تم رفض الحجز',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

