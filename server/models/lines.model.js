const { query } = require('../config/db');

/**
 * Lines Model - Database operations for Lines feature
 */

// =============================================
// LINES CRUD OPERATIONS
// =============================================

/**
 * Create a new line
 */
const createLine = async (lineData) => {
  const {
    driverId,
    name,
    lineType,
    isLadiesOnly = false,
    fromCity,
    toCity,
    fromLocation,
    toLocation,
    departureTime,
    returnTime,
    workingDays = [0, 1, 2, 3, 4, 5],
    totalSeats = 4,
    monthlyPrice,
    weeklyPrice,
    quarterlyPrice,
  } = lineData;

  const result = await query(
    `INSERT INTO lines (
      driver_id, name, line_type, is_ladies_only,
      from_city, to_city, from_location, to_location,
      departure_time, return_time, working_days,
      total_seats, available_seats,
      monthly_price, weekly_price, quarterly_price
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14, $15)
    RETURNING *`,
    [
      driverId,
      name,
      lineType,
      isLadiesOnly,
      fromCity,
      toCity,
      fromLocation ? JSON.stringify(fromLocation) : null,
      toLocation ? JSON.stringify(toLocation) : null,
      departureTime,
      returnTime,
      workingDays,
      totalSeats,
      monthlyPrice,
      weeklyPrice,
      quarterlyPrice,
    ]
  );

  return result.rows[0];
};

/**
 * Get line by ID with driver info
 */
const getLineById = async (lineId) => {
  const result = await query(
    `SELECT l.*,
      u.name as driver_name,
      u.phone as driver_phone,
      u.rating_avg as driver_rating
    FROM lines l
    JOIN users u ON l.driver_id = u.id
    WHERE l.id = $1`,
    [lineId]
  );

  return result.rows[0];
};

/**
 * Get all lines with filters
 */
const getAllLines = async (filters = {}) => {
  const {
    fromCity,
    toCity,
    lineType,
    isLadiesOnly,
    minPrice,
    maxPrice,
    status = 'active',
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = filters;

  let queryStr = `
    SELECT l.*,
      u.name as driver_name,
      u.phone as driver_phone,
      u.rating_avg as driver_rating,
      (SELECT COUNT(*) FROM line_subscriptions ls
       WHERE ls.line_id = l.id AND ls.status = 'active') as active_subscribers
    FROM lines l
    JOIN users u ON l.driver_id = u.id
    WHERE l.is_active = true
  `;

  const params = [];
  let paramIndex = 1;

  if (status) {
    queryStr += ` AND l.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (fromCity) {
    queryStr += ` AND l.from_city ILIKE $${paramIndex}`;
    params.push(`%${fromCity}%`);
    paramIndex++;
  }

  if (toCity) {
    queryStr += ` AND l.to_city ILIKE $${paramIndex}`;
    params.push(`%${toCity}%`);
    paramIndex++;
  }

  if (lineType) {
    queryStr += ` AND l.line_type = $${paramIndex}`;
    params.push(lineType);
    paramIndex++;
  }

  if (isLadiesOnly !== undefined) {
    queryStr += ` AND l.is_ladies_only = $${paramIndex}`;
    params.push(isLadiesOnly);
    paramIndex++;
  }

  if (minPrice) {
    queryStr += ` AND l.monthly_price >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice) {
    queryStr += ` AND l.monthly_price <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }

  // Count total
  const countResult = await query(
    `SELECT COUNT(*) FROM (${queryStr}) as filtered`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Add sorting and pagination
  const validSortColumns = ['created_at', 'monthly_price', 'rating_avg', 'total_subscribers'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  queryStr += ` ORDER BY l.${sortColumn} ${order}`;
  queryStr += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result = await query(queryStr, params);

  return {
    lines: result.rows,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get lines by driver ID
 */
const getLinesByDriver = async (driverId) => {
  const result = await query(
    `SELECT l.*,
      (SELECT COUNT(*) FROM line_subscriptions ls
       WHERE ls.line_id = l.id AND ls.status = 'active') as active_subscribers
    FROM lines l
    WHERE l.driver_id = $1
    ORDER BY l.created_at DESC`,
    [driverId]
  );

  return result.rows;
};

/**
 * Update line
 */
const updateLine = async (lineId, updates) => {
  const allowedFields = [
    'name', 'line_type', 'is_ladies_only',
    'from_city', 'to_city', 'from_location', 'to_location',
    'departure_time', 'return_time', 'working_days',
    'total_seats', 'monthly_price', 'weekly_price', 'quarterly_price',
    'status', 'is_active'
  ];

  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  // Map camelCase to snake_case
  const fieldMap = {
    lineType: 'line_type',
    isLadiesOnly: 'is_ladies_only',
    fromCity: 'from_city',
    toCity: 'to_city',
    fromLocation: 'from_location',
    toLocation: 'to_location',
    departureTime: 'departure_time',
    returnTime: 'return_time',
    workingDays: 'working_days',
    totalSeats: 'total_seats',
    monthlyPrice: 'monthly_price',
    weeklyPrice: 'weekly_price',
    quarterlyPrice: 'quarterly_price',
    isActive: 'is_active',
  };

  for (const [key, value] of Object.entries(updates)) {
    const dbField = fieldMap[key] || key;
    if (allowedFields.includes(dbField) && value !== undefined) {
      setClauses.push(`${dbField} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return null;
  }

  params.push(lineId);

  const result = await query(
    `UPDATE lines SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    params
  );

  return result.rows[0];
};

/**
 * Delete line (soft delete by setting is_active = false)
 */
const deleteLine = async (lineId) => {
  const result = await query(
    `UPDATE lines SET is_active = false, status = 'cancelled'
     WHERE id = $1
     RETURNING *`,
    [lineId]
  );

  return result.rows[0];
};

/**
 * Update available seats count
 */
const updateAvailableSeats = async (lineId) => {
  const result = await query(
    `UPDATE lines SET
      available_seats = total_seats - (
        SELECT COUNT(*) FROM line_subscriptions
        WHERE line_id = $1 AND status = 'active'
      ),
      total_subscribers = (
        SELECT COUNT(*) FROM line_subscriptions
        WHERE line_id = $1 AND status = 'active'
      )
     WHERE id = $1
     RETURNING available_seats, total_subscribers`,
    [lineId]
  );

  // Update status if full
  const line = result.rows[0];
  if (line && line.available_seats <= 0) {
    await query(
      `UPDATE lines SET status = 'full' WHERE id = $1`,
      [lineId]
    );
  } else if (line && line.available_seats > 0) {
    await query(
      `UPDATE lines SET status = 'active' WHERE id = $1 AND status = 'full'`,
      [lineId]
    );
  }

  return line;
};

// =============================================
// LINE STOPS OPERATIONS
// =============================================

/**
 * Add stop to line
 */
const addStop = async (lineId, stopData) => {
  const { name, location, stopOrder, arrivalTime } = stopData;

  const result = await query(
    `INSERT INTO line_stops (line_id, name, location, stop_order, arrival_time)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [lineId, name, location ? JSON.stringify(location) : null, stopOrder, arrivalTime]
  );

  return result.rows[0];
};

/**
 * Get stops for a line
 */
const getLineStops = async (lineId) => {
  const result = await query(
    `SELECT * FROM line_stops
     WHERE line_id = $1
     ORDER BY stop_order ASC`,
    [lineId]
  );

  return result.rows;
};

/**
 * Remove stop from line
 */
const removeStop = async (stopId) => {
  const result = await query(
    `DELETE FROM line_stops WHERE id = $1 RETURNING *`,
    [stopId]
  );

  return result.rows[0];
};

// =============================================
// SUBSCRIPTIONS OPERATIONS
// =============================================

/**
 * Create subscription
 */
const createSubscription = async (subscriptionData) => {
  const {
    lineId,
    passengerId,
    pickupStopId,
    subscriptionType,
    startDate,
    endDate,
    amountPaid,
    paymentMethod,
  } = subscriptionData;

  const result = await query(
    `INSERT INTO line_subscriptions (
      line_id, passenger_id, pickup_stop_id,
      subscription_type, start_date, end_date,
      amount_paid, payment_method, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
    RETURNING *`,
    [
      lineId,
      passengerId,
      pickupStopId,
      subscriptionType,
      startDate,
      endDate,
      amountPaid,
      paymentMethod,
    ]
  );

  // Update available seats
  await updateAvailableSeats(lineId);

  return result.rows[0];
};

/**
 * Check if user is already subscribed to line
 */
const isSubscribed = async (lineId, passengerId) => {
  const result = await query(
    `SELECT id FROM line_subscriptions
     WHERE line_id = $1 AND passenger_id = $2 AND status = 'active'`,
    [lineId, passengerId]
  );

  return result.rows.length > 0;
};

/**
 * Get subscription by ID
 */
const getSubscriptionById = async (subscriptionId) => {
  const result = await query(
    `SELECT ls.*,
      l.name as line_name,
      l.from_city,
      l.to_city,
      l.departure_time,
      u.name as driver_name
    FROM line_subscriptions ls
    JOIN lines l ON ls.line_id = l.id
    JOIN users u ON l.driver_id = u.id
    WHERE ls.id = $1`,
    [subscriptionId]
  );

  return result.rows[0];
};

/**
 * Get subscriptions by passenger
 */
const getSubscriptionsByPassenger = async (passengerId, status = null) => {
  let queryStr = `
    SELECT ls.*,
      l.name as line_name,
      l.from_city,
      l.to_city,
      l.departure_time,
      l.return_time,
      l.working_days,
      u.name as driver_name,
      u.phone as driver_phone
    FROM line_subscriptions ls
    JOIN lines l ON ls.line_id = l.id
    JOIN users u ON l.driver_id = u.id
    WHERE ls.passenger_id = $1
  `;

  const params = [passengerId];

  if (status) {
    queryStr += ` AND ls.status = $2`;
    params.push(status);
  }

  queryStr += ` ORDER BY ls.created_at DESC`;

  const result = await query(queryStr, params);

  return result.rows;
};

/**
 * Get subscriptions by line (for drivers)
 */
const getSubscriptionsByLine = async (lineId, status = 'active') => {
  const result = await query(
    `SELECT ls.*,
      u.name as passenger_name,
      u.phone as passenger_phone,
      st.name as pickup_stop_name
    FROM line_subscriptions ls
    JOIN users u ON ls.passenger_id = u.id
    LEFT JOIN line_stops st ON ls.pickup_stop_id = st.id
    WHERE ls.line_id = $1 AND ls.status = $2
    ORDER BY ls.created_at DESC`,
    [lineId, status]
  );

  return result.rows;
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (subscriptionId, passengerId) => {
  const result = await query(
    `UPDATE line_subscriptions
     SET status = 'cancelled', cancelled_at = NOW()
     WHERE id = $1 AND passenger_id = $2
     RETURNING *`,
    [subscriptionId, passengerId]
  );

  if (result.rows[0]) {
    // Update available seats
    await updateAvailableSeats(result.rows[0].line_id);
  }

  return result.rows[0];
};

/**
 * Get active subscription for line and passenger
 */
const getActiveSubscription = async (lineId, passengerId) => {
  const result = await query(
    `SELECT * FROM line_subscriptions
     WHERE line_id = $1 AND passenger_id = $2 AND status = 'active'`,
    [lineId, passengerId]
  );

  return result.rows[0];
};

module.exports = {
  // Lines
  createLine,
  getLineById,
  getAllLines,
  getLinesByDriver,
  updateLine,
  deleteLine,
  updateAvailableSeats,
  // Stops
  addStop,
  getLineStops,
  removeStop,
  // Subscriptions
  createSubscription,
  isSubscribed,
  getSubscriptionById,
  getSubscriptionsByPassenger,
  getSubscriptionsByLine,
  cancelSubscription,
  getActiveSubscription,
};
