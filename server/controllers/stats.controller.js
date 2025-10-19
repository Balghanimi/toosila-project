const { asyncHandler } = require('../middlewares/error');

/**
 * Get user statistics
 * GET /api/stats/user
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  const userId = req.user.id;

  // Get total offers
  const offersResult = await query(
    'SELECT COUNT(*) as total FROM offers WHERE driver_id = $1',
    [userId]
  );

  // Get active offers
  const activeOffersResult = await query(
    'SELECT COUNT(*) as total FROM offers WHERE driver_id = $1 AND is_active = true',
    [userId]
  );

  // Get completed offers
  const completedOffersResult = await query(
    'SELECT COUNT(*) as total FROM offers WHERE driver_id = $1 AND is_active = false',
    [userId]
  );

  // Get total demands
  const demandsResult = await query(
    'SELECT COUNT(*) as total FROM demands WHERE passenger_id = $1',
    [userId]
  );

  // Get active demands
  const activeDemandsResult = await query(
    'SELECT COUNT(*) as total FROM demands WHERE passenger_id = $1 AND is_active = true',
    [userId]
  );

  // Get completed trips (bookings with confirmed status)
  const completedTripsResult = await query(
    `SELECT COUNT(*) as total
     FROM bookings b
     INNER JOIN offers o ON b.offer_id = o.id
     WHERE (o.driver_id = $1 OR b.passenger_id = $1) AND b.status = 'confirmed'`,
    [userId]
  );

  // Get pending bookings as driver
  const pendingAsDriverResult = await query(
    `SELECT COUNT(*) as total
     FROM bookings b
     INNER JOIN offers o ON b.offer_id = o.id
     WHERE o.driver_id = $1 AND b.status = 'pending'`,
    [userId]
  );

  // Get pending bookings as passenger
  const pendingAsPassengerResult = await query(
    'SELECT COUNT(*) as total FROM bookings WHERE passenger_id = $1 AND status = \'pending\'',
    [userId]
  );

  // Get user rating info
  const userResult = await query(
    'SELECT rating_avg, rating_count FROM users WHERE id = $1',
    [userId]
  );

  const user = userResult.rows[0];

  res.json({
    totalOffers: parseInt(offersResult.rows[0].total),
    activeOffers: parseInt(activeOffersResult.rows[0].total),
    completedOffers: parseInt(completedOffersResult.rows[0].total),
    totalDemands: parseInt(demandsResult.rows[0].total),
    activeDemands: parseInt(activeDemandsResult.rows[0].total),
    completedTrips: parseInt(completedTripsResult.rows[0].total),
    pendingBookingsAsDriver: parseInt(pendingAsDriverResult.rows[0].total),
    pendingBookingsAsPassenger: parseInt(pendingAsPassengerResult.rows[0].total),
    totalPendingBookings: parseInt(pendingAsDriverResult.rows[0].total) + parseInt(pendingAsPassengerResult.rows[0].total),
    rating: parseFloat(user.rating_avg) || 0,
    ratingCount: parseInt(user.rating_count) || 0
  });
});

/**
 * Get recent activity
 * GET /api/stats/recent-activity
 */
const getRecentActivity = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  const userId = req.user.id;

  // Get recent bookings
  const bookingsResult = await query(
    `SELECT b.*, o.from_city, o.to_city, o.departure_time, u.name as passenger_name
     FROM bookings b
     INNER JOIN offers o ON b.offer_id = o.id
     INNER JOIN users u ON b.passenger_id = u.id
     WHERE o.driver_id = $1
     ORDER BY b.created_at DESC
     LIMIT 5`,
    [userId]
  );

  // Get recent offers
  const offersResult = await query(
    `SELECT id, from_city, to_city, departure_time, available_seats, price, created_at
     FROM offers
     WHERE driver_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [userId]
  );

  // Get recent demands
  const demandsResult = await query(
    `SELECT id, from_city, to_city, earliest_time, latest_time, created_at
     FROM demands
     WHERE passenger_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [userId]
  );

  res.json({
    recentBookings: bookingsResult.rows,
    recentOffers: offersResult.rows,
    recentDemands: demandsResult.rows
  });
});

module.exports = {
  getUserStats,
  getRecentActivity
};

