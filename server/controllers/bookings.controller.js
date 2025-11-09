/**
 * Bookings Controller
 * Handles HTTP requests for booking operations
 */

const Booking = require('../models/bookings.model');
const bookingService = require('../services/booking.service');
const { notifyNewBooking, notifyBookingStatusUpdate } = require('../socket');
const { catchAsync, sendSuccess, sendPaginatedResponse } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');
const { RESPONSE_MESSAGES, HTTP_STATUS, BOOKING_STATUS } = require('../constants');

/**
 * Create a new booking
 * @route POST /api/bookings
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {number} req.body.offerId - Offer ID
 * @param {number} [req.body.seats=1] - Number of seats to book
 * @param {string} [req.body.message] - Optional message to driver
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const createBooking = catchAsync(async (req, res) => {
  const { offerId, seats = 1, message } = req.body;

  const result = await bookingService.createBooking(req.user.id, {
    offerId,
    seats,
    message,
  });

  // Send real-time notification to driver
  const io = req.app.get('io');
  if (io) {
    notifyNewBooking(io, result.offer.driverId, {
      ...result.booking,
      fromCity: result.offer.fromCity,
      toCity: result.offer.toCity,
      passengerName: req.user.name,
    });
  }

  sendSuccess(
    res,
    { booking: result.booking },
    RESPONSE_MESSAGES.BOOKING_CREATED,
    HTTP_STATUS.CREATED
  );
});

/**
 * Get all bookings with filters and pagination
 * @route GET /api/bookings
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Items per page
 * @param {string} [req.query.status] - Filter by status
 * @param {number} [req.query.userId] - Filter by passenger ID
 * @param {number} [req.query.offerId] - Filter by offer ID
 * @param {number} [req.query.offerOwnerId] - Filter by driver ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, userId, offerId, offerOwnerId } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (userId) filters.passengerId = parseInt(userId, 10);
  if (offerId) filters.offerId = parseInt(offerId, 10);
  if (offerOwnerId) filters.driverId = parseInt(offerOwnerId, 10);

  const result = await Booking.findAll(parseInt(page, 10), parseInt(limit, 10), filters);

  sendSuccess(res, result, RESPONSE_MESSAGES.SUCCESS);
});

/**
 * Get booking by ID
 * @route GET /api/bookings/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Booking ID
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getBookingById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new NotFoundError('Booking');
  }

  // Verify user has access to this booking
  await bookingService.verifyBookingAccess(booking, req.user.id, req.user.role);

  sendSuccess(res, { booking: booking.toJSON() }, RESPONSE_MESSAGES.SUCCESS);
});

/**
 * Update booking status (offer owner or admin only)
 * @route PUT /api/bookings/:id/status
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Booking ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.status - New status
 * @param {number} [req.body.totalPrice] - Total price
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateBookingStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, totalPrice } = req.body;

  const result = await bookingService.updateBookingStatus(
    id,
    req.user.id,
    req.user.role,
    status,
    totalPrice
  );

  // Send real-time notification to passenger
  const io = req.app.get('io');
  if (io && (status === BOOKING_STATUS.ACCEPTED || status === BOOKING_STATUS.CANCELLED)) {
    notifyBookingStatusUpdate(io, result.offer.passengerId, {
      ...result.booking,
      fromCity: result.offer.fromCity,
      toCity: result.offer.toCity,
      status,
    });
  }

  sendSuccess(res, { booking: result.booking }, RESPONSE_MESSAGES.BOOKING_UPDATED);
});

/**
 * Cancel booking (booking owner only)
 * @route PUT /api/bookings/:id/cancel
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Booking ID
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const cancelBooking = catchAsync(async (req, res) => {
  const { id } = req.params;

  const booking = await bookingService.cancelBooking(id, req.user.id, req.user.role);

  sendSuccess(res, { booking }, 'Booking cancelled successfully');
});

/**
 * Get user's bookings (as passenger)
 * @route GET /api/bookings/user/:userId?
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} [req.params.userId] - User ID (optional, defaults to current user)
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Items per page
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getUserBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const passengerId = req.params.userId || req.user.id;

  const result = await Booking.getSentBookings(
    passengerId,
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  sendSuccess(res, result, RESPONSE_MESSAGES.SUCCESS);
});

/**
 * Get bookings for user's offers (as driver)
 * @route GET /api/bookings/offers
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Items per page
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getOfferBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await Booking.getReceivedBookings(
    req.user.id,
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  sendSuccess(res, result, RESPONSE_MESSAGES.SUCCESS);
});

/**
 * Get booking statistics
 * @route GET /api/bookings/stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getBookingStats = catchAsync(async (req, res) => {
  const stats = await bookingService.getBookingStats();

  sendSuccess(res, stats, RESPONSE_MESSAGES.SUCCESS);
});

/**
 * Get user booking statistics
 * @route GET /api/bookings/stats/user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getUserBookingStats = catchAsync(async (req, res) => {
  const stats = await bookingService.getUserBookingStats(req.user.id);

  sendSuccess(res, { stats }, RESPONSE_MESSAGES.SUCCESS);
});

/**
 * Get pending bookings count for current user
 * @route GET /api/bookings/pending/count
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPendingCount = catchAsync(async (req, res) => {
  const counts = await bookingService.getPendingCount(req.user.id);

  sendSuccess(res, counts, RESPONSE_MESSAGES.SUCCESS);
});

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
  getOfferBookings,
  getBookingStats,
  getUserBookingStats,
  getPendingCount,
};
