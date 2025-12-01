const { query } = require('../config/db');
const { asyncHandler, AppError } = require('../middlewares/error');

// Get all unique cities from categories, offers, and demands
const getCities = asyncHandler(async (req, res) => {
  // Combine cities from:
  // 1. Categories table (predefined cities)
  // 2. Offers table (from_city, to_city)
  // 3. Demands table (from_city, to_city)
  const result = await query(`
    SELECT DISTINCT city FROM (
      -- Cities from categories table
      SELECT name as city FROM categories WHERE is_active = true
      UNION
      -- Origin cities from offers
      SELECT from_city as city FROM offers WHERE from_city IS NOT NULL AND from_city != ''
      UNION
      -- Destination cities from offers
      SELECT to_city as city FROM offers WHERE to_city IS NOT NULL AND to_city != ''
      UNION
      -- Origin cities from demands
      SELECT from_city as city FROM demands WHERE from_city IS NOT NULL AND from_city != ''
      UNION
      -- Destination cities from demands
      SELECT to_city as city FROM demands WHERE to_city IS NOT NULL AND to_city != ''
    ) AS all_cities
    WHERE city IS NOT NULL AND TRIM(city) != ''
    ORDER BY city
  `);

  const cities = result.rows.map(row => row.city);

  res.json({
    cities,
    count: cities.length
  });
});

// Add a new city (auto-create if doesn't exist)
const addCity = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    throw new AppError('اسم المدينة يجب أن يكون حرفين على الأقل', 400);
  }

  const cityName = name.trim();

  // Check if city already exists
  const existingCity = await query(
    'SELECT id, name FROM categories WHERE LOWER(name) = LOWER($1)',
    [cityName]
  );

  if (existingCity.rows.length > 0) {
    return res.json({
      message: 'المدينة موجودة مسبقاً',
      city: existingCity.rows[0].name,
      alreadyExists: true
    });
  }

  // Insert new city
  const result = await query(
    'INSERT INTO categories (name, is_active) VALUES ($1, true) RETURNING name',
    [cityName]
  );

  res.status(201).json({
    message: 'تم إضافة المدينة بنجاح',
    city: result.rows[0].name,
    alreadyExists: false
  });
});

module.exports = {
  getCities,
  addCity
};
