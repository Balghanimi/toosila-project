const { query } = require('../config/db');

class Rating {
  constructor(data) {
    this.id = data.id;
    this.rideId = data.ride_id;
    this.fromUserId = data.from_user_id;
    this.toUserId = data.to_user_id;
    this.rating = data.rating;
    this.comment = data.comment;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new rating
  static async create(ratingData) {
    const { rideId, fromUserId, toUserId, rating, comment } = ratingData;
    const result = await query(
      `INSERT INTO ratings (ride_id, from_user_id, to_user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rideId, fromUserId, toUserId, rating, comment]
    );
    return new Rating(result.rows[0]);
  }

  // Find rating by ID
  static async findById(id) {
    const result = await query(
      `SELECT r.*, u1.name as from_user_name, u2.name as to_user_name
       FROM ratings r
       JOIN users u1 ON r.from_user_id = u1.id
       JOIN users u2 ON r.to_user_id = u2.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows.length > 0 ? new Rating(result.rows[0]) : null;
  }

  // Get all ratings with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.toUserId) {
      whereClause += ` AND r.to_user_id = $${paramCount}`;
      values.push(filters.toUserId);
      paramCount++;
    }

    if (filters.fromUserId) {
      whereClause += ` AND r.from_user_id = $${paramCount}`;
      values.push(filters.fromUserId);
      paramCount++;
    }

    if (filters.rideId) {
      whereClause += ` AND r.ride_id = $${paramCount}`;
      values.push(filters.rideId);
      paramCount++;
    }

    if (filters.minRating) {
      whereClause += ` AND r.rating >= $${paramCount}`;
      values.push(filters.minRating);
      paramCount++;
    }

    if (filters.maxRating) {
      whereClause += ` AND r.rating <= $${paramCount}`;
      values.push(filters.maxRating);
      paramCount++;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT r.*, u1.name as from_user_name, u2.name as to_user_name
       FROM ratings r
       JOIN users u1 ON r.from_user_id = u1.id
       JOIN users u2 ON r.to_user_id = u2.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM ratings r ${whereClause}`,
      values.slice(0, -2)
    );

    return {
      ratings: result.rows.map(row => new Rating(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get ratings for a specific user
  static async getByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT r.*, u.name as from_user_name
       FROM ratings r
       JOIN users u ON r.from_user_id = u.id
       WHERE r.to_user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM ratings WHERE to_user_id = $1',
      [userId]
    );

    return {
      ratings: result.rows.map(row => new Rating(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get rating statistics for a user
  static async getStats(userId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM ratings 
       WHERE to_user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  // Check if user has already rated this ride
  static async hasRated(rideId, fromUserId) {
    const result = await query(
      'SELECT id FROM ratings WHERE ride_id = $1 AND from_user_id = $2',
      [rideId, fromUserId]
    );
    return result.rows.length > 0;
  }

  // Update user rating averages
  static async updateUserRating(userId) {
    const result = await query(
      `UPDATE users 
       SET rating_avg = (
         SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE to_user_id = $1
       ),
       rating_count = (
         SELECT COUNT(*) FROM ratings WHERE to_user_id = $1
       )
       WHERE id = $1
       RETURNING rating_avg, rating_count`,
      [userId]
    );
    return result.rows[0];
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      rideId: this.rideId,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Rating;