const { pool } = require('../config/db');

/**
 * Line Interest Model
 * Handles database operations for line interest registrations
 */

/**
 * Register interest in Lines feature
 * @param {string} phone - User phone number
 * @param {string} userType - 'student' or 'employee'
 * @param {string} area - User residential area (free text)
 * @param {string} destination - User destination (free text)
 * @param {string} preferredTime - Preferred departure time
 * @param {string} userId - Optional user ID if logged in
 * @returns {Object} Created/updated interest record
 */
const createInterest = async (phone, userType = 'student', area = null, destination = null, preferredTime = null, userId = null) => {
  const query = `
    INSERT INTO line_interests (phone, user_type, area, destination, preferred_time, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (phone) DO UPDATE SET
      user_type = COALESCE(EXCLUDED.user_type, line_interests.user_type),
      area = COALESCE(EXCLUDED.area, line_interests.area),
      destination = COALESCE(EXCLUDED.destination, line_interests.destination),
      preferred_time = COALESCE(EXCLUDED.preferred_time, line_interests.preferred_time),
      user_id = COALESCE(EXCLUDED.user_id, line_interests.user_id),
      updated_at = NOW()
    RETURNING *
  `;
  const result = await pool.query(query, [phone, userType, area, destination, preferredTime, userId]);
  return result.rows[0];
};

/**
 * Get total count of interested users
 * @returns {number} Total count
 */
const getInterestCount = async () => {
  const query = 'SELECT COUNT(*) FROM line_interests';
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

/**
 * Get count by user type
 * @returns {Object} Counts by type
 */
const getInterestCountByType = async () => {
  const query = `
    SELECT
      user_type,
      COUNT(*) as count
    FROM line_interests
    GROUP BY user_type
  `;
  const result = await pool.query(query);
  return result.rows.reduce((acc, row) => {
    acc[row.user_type] = parseInt(row.count, 10);
    return acc;
  }, { student: 0, employee: 0 });
};

/**
 * Check if phone is already registered
 * @param {string} phone - Phone number to check
 * @returns {boolean} Whether phone is registered
 */
const isPhoneRegistered = async (phone) => {
  const query = 'SELECT 1 FROM line_interests WHERE phone = $1';
  const result = await pool.query(query, [phone]);
  return result.rows.length > 0;
};

/**
 * Get all interests (for admin)
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Array} Interest records
 */
const getAllInterests = async (limit = 100, offset = 0) => {
  const query = `
    SELECT
      li.*,
      u.name as user_name
    FROM line_interests li
    LEFT JOIN users u ON li.user_id = u.id
    ORDER BY li.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

/**
 * Mark interests as notified
 * @param {Array} ids - Array of interest IDs to mark
 * @returns {number} Number of records updated
 */
const markAsNotified = async (ids) => {
  if (!ids || ids.length === 0) return 0;

  const query = `
    UPDATE line_interests
    SET notified = TRUE, updated_at = NOW()
    WHERE id = ANY($1)
    RETURNING id
  `;
  const result = await pool.query(query, [ids]);
  return result.rowCount;
};

/**
 * Get unnotified interests
 * @returns {Array} Unnotified interest records
 */
const getUnnotifiedInterests = async () => {
  const query = `
    SELECT * FROM line_interests
    WHERE notified = FALSE
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createInterest,
  getInterestCount,
  getInterestCountByType,
  isPhoneRegistered,
  getAllInterests,
  markAsNotified,
  getUnnotifiedInterests,
};
