const Booking = require('../models/bookings.model');
const Offer = require('../models/offers.model');
const { asyncHandler, AppError } = require('../middlewares/error');
const { notifyNewBooking, notifyBookingStatusUpdate } = require('../socket');

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
  const { offerId, seats = 1, message } = req.body;

  // Check if offer exists and is active
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError('Offer not found', 404);
  }

  if (!offer.isActive) {
    throw new AppError('Offer is not available', 400);
  }

  // Check if user is not booking their own offer
  if (offer.driverId === req.user.id) {
    throw new AppError('You cannot book your own offer', 400);
  }

  // Check if enough seats are available
  const { query } = require('../config/db');
  const bookedSeats = await query(
    `SELECT COALESCE(SUM(seats), 0) as total_booked
     FROM bookings
     WHERE offer_id = $1
     AND status IN ('pending', 'confirmed')`,
    [offerId]
  );

  const totalBooked = parseInt(bookedSeats.rows[0].total_booked) || 0;
  const availableSeats = offer.seats - totalBooked;

  if (seats > availableSeats) {
    throw new AppError(`Only ${availableSeats} seat(s) available`, 400);
  }

  const booking = await Booking.create({
    passengerId: req.user.id,
    offerId,
    seats,
    message
  });

  // Send real-time notification to driver
  const io = req.app.get('io');
  if (io) {
    notifyNewBooking(io, offer.driverId, {
      ...booking.toJSON(),
      fromCity: offer.fromCity,
      toCity: offer.toCity,
      passengerName: req.user.name
    });
  }

  res.status(201).json({
    message: 'Booking request sent successfully',
    booking: booking.toJSON()
  });
});

// Get all bookings with filters and pagination
const getBookings = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    userId,
    offerId,
    offerOwnerId
  } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (userId) filters.passengerId = parseInt(userId);
  if (offerId) filters.offerId = parseInt(offerId);
  if (offerOwnerId) filters.driverId = parseInt(offerOwnerId);

  const result = await Booking.findAll(parseInt(page), parseInt(limit), filters);
  
  res.json(result);
});

// Get booking by ID
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if user has access to this booking
  if (booking.passengerId !== req.user.id && req.user.role !== 'admin') {
    // Check if user is the offer owner
    const offer = await Offer.findById(booking.offerId);
    if (!offer || offer.driverId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }
  }

  res.json({
    booking: booking.toJSON()
  });
});

// Update booking status (offer owner or admin only)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, totalPrice } = req.body;
  
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if user is the offer owner or admin
  const offer = await Offer.findById(booking.offerId);
  if (!offer || (offer.driverId !== req.user.id && req.user.role !== 'admin')) {
    throw new AppError('You can only update bookings for your offers', 403);
  }

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updatedBooking = await booking.updateStatus(status, totalPrice);

  // Send real-time notification to passenger
  const io = req.app.get('io');
  if (io && (status === 'confirmed' || status === 'cancelled')) {
    notifyBookingStatusUpdate(io, booking.passengerId, {
      ...updatedBooking.toJSON(),
      fromCity: offer.fromCity,
      toCity: offer.toCity,
      status: status
    });
  }

  res.json({
    message: 'Booking status updated successfully',
    booking: updatedBooking.toJSON()
  });
});

// Cancel booking (booking owner only)
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if user owns the booking
  if (booking.passengerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  // Check if booking can be cancelled
  if (booking.status === 'cancelled') {
    throw new AppError('Booking is already cancelled', 400);
  }

  if (booking.status === 'completed') {
    throw new AppError('Cannot cancel completed booking', 400);
  }

  const updatedBooking = await booking.updateStatus('cancelled');

  res.json({
    message: 'Booking cancelled successfully',
    booking: updatedBooking.toJSON()
  });
});

// Get user's bookings (as passenger)
const getUserBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const passengerId = req.params.userId || req.user.id;

  const result = await Booking.getSentBookings(passengerId, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get bookings for user's offers (as driver)
const getOfferBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await Booking.getReceivedBookings(req.user.id, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get booking statistics
const getBookingStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  
  const result = await query(`
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      AVG(total_price) as average_booking_value
    FROM bookings
  `);

  res.json({
    stats: result.rows[0]
  });
});

// Get user booking statistics
const getUserBookingStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query(`
    SELECT
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      AVG(total_price) as average_booking_value
    FROM bookings
    WHERE passenger_id = $1
  `, [req.user.id]);

  res.json({
    stats: result.rows[0]
  });
});

// Get pending bookings count for current user (both as passenger and driver)
const getPendingCount = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  // Count bookings I received on my offers (as driver) that are pending
  const receivedResult = await query(`
    SELECT COUNT(*) as count
    FROM bookings b
    INNER JOIN offers o ON b.offer_id = o.id
    WHERE o.driver_id = $1 AND b.status = 'pending'
  `, [req.user.id]);

  // Count bookings I made (as passenger) that are pending
  const sentResult = await query(`
    SELECT COUNT(*) as count
    FROM bookings
    WHERE passenger_id = $1 AND status = 'pending'
  `, [req.user.id]);

  res.json({
    receivedPending: parseInt(receivedResult.rows[0].count),
    sentPending: parseInt(sentResult.rows[0].count),
    totalPending: parseInt(receivedResult.rows[0].count) + parseInt(sentResult.rows[0].count)
  });
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
  getPendingCount
};

