const { query } = require('../config/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.isDriver = data.is_driver;
    this.languagePreference = data.language_preference;
    this.ratingAvg = parseFloat(data.rating_avg) || 0.00;
    this.ratingCount = data.rating_count || 0;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, passwordHash, isDriver = false, languagePreference = 'ar' } = userData;
    const result = await query(
      `INSERT INTO users (name, email, password_hash, is_driver, language_preference)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, passwordHash, isDriver, languagePreference]
    );
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Get user with password hash (for authentication)
  static async findByEmailWithPassword(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Update user
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return new User(result.rows[0]);
  }

  // Update password
  async updatePassword(passwordHash) {
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [passwordHash, this.id]
    );
    return new User(result.rows[0]);
  }

  // Deactivate user
  async deactivate() {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [this.id]
    );
    return new User(result.rows[0]);
  }

  // Get all users with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.isDriver !== undefined) {
      whereClause += ` AND is_driver = $${paramCount}`;
      values.push(filters.isDriver);
      paramCount++;
    }

    if (filters.languagePreference) {
      whereClause += ` AND language_preference = $${paramCount}`;
      values.push(filters.languagePreference);
      paramCount++;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT * FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values.slice(0, -2)
    );

    return {
      users: result.rows.map(row => new User(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get user statistics
  static async getStats(userId) {
    const result = await query(
      `SELECT 
        (SELECT COUNT(*) FROM offers WHERE driver_id = $1 AND is_active = true) as active_offers,
        (SELECT COUNT(*) FROM demands WHERE passenger_id = $1 AND is_active = true) as active_demands,
        (SELECT COUNT(*) FROM bookings WHERE passenger_id = $1) as total_bookings,
        (SELECT AVG(rating) FROM ratings WHERE to_user_id = $1) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE to_user_id = $1) as total_ratings`,
      [userId]
    );
    return result.rows[0];
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { passwordHash, ...user } = this;
    return user;
  }
}

module.exports = User;

