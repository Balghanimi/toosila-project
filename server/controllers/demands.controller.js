const Demand = require('../models/demands.model');
const { asyncHandler, AppError } = require('../middlewares/error');

// Create a new demand
const createDemand = asyncHandler(async (req, res) => {
  const { title, description, maxPrice, category, location } = req.body;
  
  const demand = await Demand.create({
    userId: req.user.id,
    title,
    description,
    maxPrice,
    category,
    location
  });

  res.status(201).json({
    message: 'Demand created successfully',
    demand: demand.toJSON()
  });
});

// Get all demands with filters and pagination
const getDemands = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    location, 
    maxPrice, 
    search,
    userId 
  } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (location) filters.location = location;
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  if (search) filters.search = search;
  if (userId) filters.userId = parseInt(userId);

  const result = await Demand.findAll(parseInt(page), parseInt(limit), filters);
  
  res.json(result);
});

// Get demand by ID
const getDemandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const demand = await Demand.findById(id);
  if (!demand) {
    throw new AppError('Demand not found', 404);
  }

  res.json({
    demand: demand.toJSON()
  });
});

// Update demand
const updateDemand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, maxPrice, category, location } = req.body;
  
  const demand = await Demand.findById(id);
  if (!demand) {
    throw new AppError('Demand not found', 404);
  }

  // Check if user owns the demand
  if (demand.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only update your own demands', 403);
  }

  const updatedDemand = await demand.update({
    title,
    description,
    max_price: maxPrice,
    category,
    location
  });

  res.json({
    message: 'Demand updated successfully',
    demand: updatedDemand.toJSON()
  });
});

// Deactivate demand
const deactivateDemand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const demand = await Demand.findById(id);
  if (!demand) {
    throw new AppError('Demand not found', 404);
  }

  // Check if user owns the demand
  if (demand.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only deactivate your own demands', 403);
  }

  await demand.deactivate();

  res.json({
    message: 'Demand deactivated successfully'
  });
});

// Get user's demands
const getUserDemands = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.params.userId || req.user.id;

  const result = await Demand.findByUserId(userId, parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Get demand categories
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

// Get demand statistics (admin only)
const getDemandStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  
  const result = await query(`
    SELECT 
      COUNT(*) as total_demands,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_demands,
      COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_demands,
      AVG(max_price) as average_max_price,
      COUNT(CASE WHEN category = 'transportation' THEN 1 END) as transportation_count,
      COUNT(CASE WHEN category = 'accommodation' THEN 1 END) as accommodation_count,
      COUNT(CASE WHEN category = 'food' THEN 1 END) as food_count,
      COUNT(CASE WHEN category = 'services' THEN 1 END) as services_count,
      COUNT(CASE WHEN category = 'other' THEN 1 END) as other_count
    FROM demands
  `);

  res.json({
    stats: result.rows[0]
  });
});

module.exports = {
  createDemand,
  getDemands,
  getDemandById,
  updateDemand,
  deactivateDemand,
  getUserDemands,
  getCategories,
  getDemandStats
};

