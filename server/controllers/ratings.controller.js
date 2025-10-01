const Rating = require('../models/ratings.model');
const Booking = require('../models/bookings.model');
const { asyncHandler, AppError } = require('../middlewares/error');

// Create a new rating
const createRating = asyncHandler(async (req, res) => {
  const { targetUserId, bookingId, rating, comment } = req.body;
  
  // Check if target user exists
  const User = require('../models/users.model');
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError('Target user not found', 404);
  }

  // Check if booking exists and is completed
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== 'completed') {
    throw new AppError('You can only rate completed bookings', 400);
  }

  // Check if user is part of the booking
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    // Check if user is the offer owner
    const Offer = require('../models/offers.model');
    const offer = await Offer.findById(booking.offerId);
    if (!offer || offer.userId !== req.user.id) {
      throw new AppError('You can only rate bookings you are part of', 403);
    }
  }

  // Check if user has already rated this booking
  const existingRating = await Rating.findByBookingAndUser(bookingId, req.user.id);
  if (existingRating) {
    throw new AppError('You have already rated this booking', 400);
  }

  const ratingData = await Rating.create({
    userId: req.user.id,
    targetUserId,
    bookingId,
    rating,
    comment
  });

  res.status(201).json({
    message: 'Rating created successfully',
    rating: ratingData.toJSON()
  });
});

// Get all ratings with filters and pagination
const getRatings = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    targetUserId,
    userId,
    bookingId,
    minRating
  } = req.query;

  const filters = {};
  if (targetUserId) filters.targetUserId = parseInt(targetUserId);
  if (userId) filters.userId = parseInt(userId);
  if (bookingId) filters.bookingId = parseInt(bookingId);
  if (minRating) filters.minRating = parseInt(minRating);

  const result = await Rating.findAll(parseInt(page), parseInt(limit), filters);
  
  res.json(result);
});

// Get rating by ID
const getRatingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const rating = await Rating.findById(id);
  if (!rating) {
    throw new AppError('Rating not found', 404);
  }

  res.json({
    rating: rating.toJSON()
  });
});

// Update rating
const updateRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  
  const ratingData = await Rating.findById(id);
  if (!ratingData) {
    throw new AppError('Rating not found', 404);
  }

  // Check if user owns the rating
  if (ratingData.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only update your own ratings', 403);
  }

  const updatedRating = await ratingData.update({
    rating,
    comment
  });

  res.json({
    message: 'Rating updated successfully',
    rating: updatedRating.toJSON()
  });
});

// Delete rating
const deleteRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const rating = await Rating.findById(id);
  if (!rating) {
    throw new AppError('Rating not found', 404);
  }

  // Check if user owns the rating
  if (rating.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own ratings', 403);
  }

  await rating.delete();

  res.json({
    message: 'Rating deleted successfully'
  });
});

// Get ratings for a specific user
const getUserRatings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await Rating.findByTargetUserId(parseInt(userId), parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Get user's average rating
const getUserAverageRating = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const stats = await Rating.getAverageRating(parseInt(userId));
  
  res.json(stats);
});

// Get top rated users
const getTopRatedUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const result = await Rating.getTopRatedUsers(parseInt(limit));
  
  res.json({
    topUsers: result
  });
});

// Get rating statistics
const getRatingStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  
  const result = await query(`
    SELECT 
      COUNT(*) as total_ratings,
      AVG(rating) as average_rating,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
    FROM ratings
  `);

  res.json({
    stats: result.rows[0]
  });
});

module.exports = {
  createRating,
  getRatings,
  getRatingById,
  updateRating,
  deleteRating,
  getUserRatings,
  getUserAverageRating,
  getTopRatedUsers,
  getRatingStats
};

