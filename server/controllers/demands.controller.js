const Demand = require('../models/demands.model');
const { asyncHandler, AppError } = require('../middlewares/error');
const moderationAgent = require('../agents/moderation.agent');
const { query } = require('../config/db');

// Create a new demand
const createDemand = asyncHandler(async (req, res) => {
  const { fromCity, toCity, earliestTime, latestTime, seats, budgetMax } = req.body;

  // Create demand
  const demand = await Demand.create({
    passengerId: req.user.id,
    fromCity,
    toCity,
    earliestTime,
    latestTime,
    seats,
    budgetMax
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الطلب بنجاح',
    demand: demand.toJSON()
  });
});

// Get all demands with filters and pagination
const getDemands = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    fromCity,
    toCity,
    maxBudget,
    passengerId,
    earliestDate,
    latestDate
  } = req.query;

  const filters = {};
  if (fromCity) filters.fromCity = fromCity;
  if (toCity) filters.toCity = toCity;
  if (maxBudget) filters.maxBudget = parseFloat(maxBudget);
  if (passengerId) filters.passengerId = passengerId;
  if (earliestDate) filters.earliestDate = earliestDate;
  if (latestDate) filters.latestDate = latestDate;

  const result = await Demand.findAll(parseInt(page), parseInt(limit), filters);

  res.json(result);
});

// Get demand by ID
const getDemandById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const demand = await Demand.findById(id);
  if (!demand) {
    throw new AppError('الطلب غير موجود', 404);
  }

  res.json({
    demand: demand.toJSON()
  });
});

// Update demand
const updateDemand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fromCity, toCity, earliestTime, latestTime, seats, budgetMax } = req.body;

  const demand = await Demand.findById(id);
  if (!demand) {
    throw new AppError('الطلب غير موجود', 404);
  }

  // Check if user owns the demand
  if (demand.passengerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('يمكنك فقط تعديل طلباتك الخاصة', 403);
  }

  const updateData = {};
  if (fromCity) updateData.from_city = fromCity;
  if (toCity) updateData.to_city = toCity;
  if (earliestTime) updateData.earliest_time = earliestTime;
  if (latestTime) updateData.latest_time = latestTime;
  if (seats) updateData.seats = seats;
  if (budgetMax) updateData.budget_max = budgetMax;

  const updatedDemand = await demand.update(updateData);

  res.json({
    message: 'تم تحديث الطلب بنجاح',
    demand: updatedDemand.toJSON()
  });
});

// Deactivate demand
const deactivateDemand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const demand = await Demand.findById(id);
  if (!demand) {
    throw new AppError('الطلب غير موجود', 404);
  }

  // Check if user owns the demand
  if (demand.passengerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('يمكنك فقط إلغاء تفعيل طلباتك الخاصة', 403);
  }

  await demand.deactivate();

  res.json({
    message: 'تم إلغاء تفعيل الطلب بنجاح'
  });
});

// Get user's demands
const getUserDemands = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const passengerId = req.params.userId || req.user.id;

  const result = await Demand.findByPassengerId(passengerId, parseInt(page), parseInt(limit));

  res.json(result);
});

// Search demands
const searchDemands = asyncHandler(async (req, res) => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query;

  if (!searchTerm) {
    throw new AppError('مطلوب كلمة بحث', 400);
  }

  const result = await Demand.search(searchTerm, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get demand categories (Iraqi cities)
const getCategories = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query('SELECT * FROM categories WHERE is_active = true ORDER BY name');

  res.json({
    categories: result.rows
  });
});

// Get demand statistics (admin only)
const getDemandStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query(`
    SELECT
      COUNT(*) as total_demands,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_demands,
      COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_demands,
      AVG(budget_max) as average_budget_max
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
  searchDemands,
  getCategories,
  getDemandStats
};
console.log('DEMAND CREATE FUNCTION LOADED');
