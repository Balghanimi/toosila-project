const { query } = require('../config/db');
const { asyncHandler, AppError } = require('../middlewares/error');

// Get all active cities
const getCities = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT name FROM categories WHERE is_active = true ORDER BY name',
    []
  );

  const cities = result.rows.map(row => row.name);

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
