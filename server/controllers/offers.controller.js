const Offer = require('../models/offers.model');
const { asyncHandler, AppError } = require('../middlewares/error');
const { invalidateOfferCache, invalidateUserStats } = require('../middlewares/cache');
// const moderationAgent = require('../agents/moderation.agent'); // Temporarily disabled
// const { query } = require('../config/db'); // Temporarily disabled

// Create a new offer
const createOffer = asyncHandler(async (req, res) => {
  const { fromCity, toCity, departureTime, seats, price } = req.body;

  // Create offer
  const offer = await Offer.create({
    driverId: req.user.id,
    fromCity,
    toCity,
    departureTime,
    seats,
    price
  });

  // Invalidate offer cache and user stats
  invalidateOfferCache();
  invalidateUserStats(req.user.id);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء العرض بنجاح',
    offer: offer.toJSON()
  });
});

// Get all offers with filters and pagination
const getOffers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    fromCity,
    toCity,
    minPrice,
    maxPrice,
    minSeats,
    driverId,
    departureDate,
    sortBy = 'date'
  } = req.query;

  const filters = {};
  if (fromCity) filters.fromCity = fromCity;
  if (toCity) filters.toCity = toCity;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  if (minSeats) filters.minSeats = parseInt(minSeats);
  if (driverId) filters.driverId = driverId;
  if (departureDate) filters.departureDate = departureDate;
  if (sortBy) filters.sortBy = sortBy;

  const result = await Offer.findAll(parseInt(page), parseInt(limit), filters);

  res.json(result);
});

// Get offer by ID
const getOfferById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const offer = await Offer.findById(id);
  if (!offer) {
    throw new AppError('العرض غير موجود', 404);
  }

  // Get offer statistics
  const stats = await Offer.getStats(id);

  res.json({
    offer: offer.toJSON(),
    stats
  });
});

// Update offer
const updateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fromCity, toCity, departureTime, seats, price } = req.body;

  const offer = await Offer.findById(id);
  if (!offer) {
    throw new AppError('العرض غير موجود', 404);
  }

  // Check if user owns the offer
  if (offer.driverId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('يمكنك فقط تعديل عروضك الخاصة', 403);
  }

  const updateData = {};
  if (fromCity) updateData.from_city = fromCity;
  if (toCity) updateData.to_city = toCity;
  if (departureTime) updateData.departure_time = departureTime;
  if (seats) updateData.seats = seats;
  if (price) updateData.price = price;

  const updatedOffer = await offer.update(updateData);

  // Invalidate offer cache
  invalidateOfferCache();

  res.json({
    message: 'تم تحديث العرض بنجاح',
    offer: updatedOffer.toJSON()
  });
});

// Deactivate offer
const deactivateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const offer = await Offer.findById(id);
  if (!offer) {
    throw new AppError('العرض غير موجود', 404);
  }

  // Check if user owns the offer
  if (offer.driverId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('يمكنك فقط إلغاء تفعيل عروضك الخاصة', 403);
  }

  await offer.deactivate();

  // Invalidate offer cache and user stats
  invalidateOfferCache();
  invalidateUserStats(offer.driverId);

  res.json({
    message: 'تم إلغاء تفعيل العرض بنجاح'
  });
});

// Get user's offers
const getUserOffers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const driverId = req.params.userId || req.user.id;

  const result = await Offer.findByDriverId(driverId, parseInt(page), parseInt(limit));

  res.json(result);
});

// Search offers
const searchOffers = asyncHandler(async (req, res) => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query;

  if (!searchTerm) {
    throw new AppError('مطلوب كلمة بحث', 400);
  }

  const result = await Offer.search(searchTerm, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get offer categories (Iraqi cities)
const getCategories = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query('SELECT * FROM categories WHERE is_active = true ORDER BY name');

  res.json({
    categories: result.rows
  });
});

// Get offer statistics (admin only)
const getOfferStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  
  const result = await query(`
    SELECT
      COUNT(*)::int as total_offers,
      COUNT(CASE WHEN is_active = true THEN 1 END)::int as active_offers,
      COUNT(CASE WHEN is_active = false THEN 1 END)::int as inactive_offers,
      AVG(price)::numeric(10,2) as average_price,
      SUM(seats)::int as total_seats
    FROM offers
  `);

  res.json({
    stats: result.rows[0]
  });
});

module.exports = {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deactivateOffer,
  getUserOffers,
  searchOffers,
  getCategories,
  getOfferStats
};

