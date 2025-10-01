const Offer = require('../models/offers.model');
const { asyncHandler, AppError } = require('../middlewares/error');

// Create a new offer
const createOffer = asyncHandler(async (req, res) => {
  const { title, description, price, category, location } = req.body;
  
  const offer = await Offer.create({
    userId: req.user.id,
    title,
    description,
    price,
    category,
    location
  });

  res.status(201).json({
    message: 'Offer created successfully',
    offer: offer.toJSON()
  });
});

// Get all offers with filters and pagination
const getOffers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    location, 
    minPrice, 
    maxPrice, 
    search,
    userId 
  } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (location) filters.location = location;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  if (search) filters.search = search;
  if (userId) filters.userId = parseInt(userId);

  const result = await Offer.findAll(parseInt(page), parseInt(limit), filters);
  
  res.json(result);
});

// Get offer by ID
const getOfferById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new AppError('Offer not found', 404);
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
  const { title, description, price, category, location } = req.body;
  
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new AppError('Offer not found', 404);
  }

  // Check if user owns the offer
  if (offer.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only update your own offers', 403);
  }

  const updatedOffer = await offer.update({
    title,
    description,
    price,
    category,
    location
  });

  res.json({
    message: 'Offer updated successfully',
    offer: updatedOffer.toJSON()
  });
});

// Deactivate offer
const deactivateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new AppError('Offer not found', 404);
  }

  // Check if user owns the offer
  if (offer.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only deactivate your own offers', 403);
  }

  await offer.deactivate();

  res.json({
    message: 'Offer deactivated successfully'
  });
});

// Get user's offers
const getUserOffers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.params.userId || req.user.id;

  const result = await Offer.findByUserId(userId, parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Search offers
const searchOffers = asyncHandler(async (req, res) => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query;
  
  if (!searchTerm) {
    throw new AppError('Search term is required', 400);
  }

  const result = await Offer.search(searchTerm, parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Get offer categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = [
    { value: 'transportation', label: 'Transportation' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' }
  ];

  res.json({ categories });
});

// Get offer statistics (admin only)
const getOfferStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  
  const result = await query(`
    SELECT 
      COUNT(*) as total_offers,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_offers,
      COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_offers,
      AVG(price) as average_price,
      COUNT(CASE WHEN category = 'transportation' THEN 1 END) as transportation_count,
      COUNT(CASE WHEN category = 'accommodation' THEN 1 END) as accommodation_count,
      COUNT(CASE WHEN category = 'food' THEN 1 END) as food_count,
      COUNT(CASE WHEN category = 'services' THEN 1 END) as services_count,
      COUNT(CASE WHEN category = 'other' THEN 1 END) as other_count
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

