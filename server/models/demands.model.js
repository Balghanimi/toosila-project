const { query } = require('../config/db');

class Demand {
  constructor(data) {
    this.id = data.id;
    this.passengerId = data.passenger_id;
    this.fromCity = data.from_city;
    this.toCity = data.to_city;
    this.earliestTime = data.earliest_time;
    this.latestTime = data.latest_time;
    this.seats = data.seats;
    this.budgetMax = parseFloat(data.budget_max);
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    // Additional fields from JOIN queries
    if (data.name) this.name = data.name;
    if (data.rating_avg) this.ratingAvg = parseFloat(data.rating_avg);
    if (data.rating_count) this.ratingCount = parseInt(data.rating_count);
    if (data.response_count !== undefined) this.responseCount = parseInt(data.response_count);
  }

  // Create a new demand
  static async create(demandData) {
    const { passengerId, fromCity, toCity, earliestTime, latestTime, seats, budgetMax } = demandData;
    const result = await query(
      `INSERT INTO demands (passenger_id, from_city, to_city, earliest_time, latest_time, seats, budget_max, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [passengerId, fromCity, toCity, earliestTime, latestTime, seats, budgetMax]
    );
    return new Demand(result.rows[0]);
  }

  // Find demand by ID
  static async findById(id) {
    const result = await query(
      `SELECT d.*, u.name, u.rating_avg, u.rating_count
       FROM demands d
       JOIN users u ON d.passenger_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows.length > 0 ? new Demand(result.rows[0]) : null;
  }

  // Get all demands with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE d.is_active = true';
    const values = [];
    let paramCount = 1;

    if (filters.fromCity) {
      whereClause += ` AND d.from_city ILIKE $${paramCount}`;
      values.push(`%${filters.fromCity}%`);
      paramCount++;
    }

    if (filters.toCity) {
      whereClause += ` AND d.to_city ILIKE $${paramCount}`;
      values.push(`%${filters.toCity}%`);
      paramCount++;
    }

    if (filters.maxBudget) {
      whereClause += ` AND d.budget_max <= $${paramCount}`;
      values.push(filters.maxBudget);
      paramCount++;
    }

    if (filters.passengerId) {
      whereClause += ` AND d.passenger_id = $${paramCount}`;
      values.push(filters.passengerId);
      paramCount++;
    }

    if (filters.earliestDate) {
      whereClause += ` AND DATE(d.earliest_time) >= $${paramCount}`;
      values.push(filters.earliestDate);
      paramCount++;
    }

    if (filters.latestDate) {
      whereClause += ` AND DATE(d.latest_time) <= $${paramCount}`;
      values.push(filters.latestDate);
      paramCount++;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT d.*, u.name, u.rating_avg, u.rating_count,
              COUNT(dr.id) as response_count
       FROM demands d
       JOIN users u ON d.passenger_id = u.id
       LEFT JOIN demand_responses dr ON d.id = dr.demand_id
       ${whereClause}
       GROUP BY d.id, u.name, u.rating_avg, u.rating_count
       ORDER BY d.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM demands d ${whereClause}`,
      values.slice(0, -2)
    );

    return {
      demands: result.rows.map(row => new Demand(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Update demand
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
      `UPDATE demands SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return new Demand(result.rows[0]);
  }

  // Deactivate demand
  async deactivate() {
    const result = await query(
      'UPDATE demands SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [this.id]
    );
    return new Demand(result.rows[0]);
  }

  // Get demands by passenger
  static async findByPassengerId(passengerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT * FROM demands
       WHERE passenger_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [passengerId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM demands WHERE passenger_id = $1',
      [passengerId]
    );

    return {
      demands: result.rows.map(row => new Demand(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Search demands
  static async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT d.*, u.name, u.rating_avg, u.rating_count
       FROM demands d
       JOIN users u ON d.passenger_id = u.id
       WHERE d.is_active = true
       AND (d.from_city ILIKE $1 OR d.to_city ILIKE $1)
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM demands 
       WHERE is_active = true 
       AND (from_city ILIKE $1 OR to_city ILIKE $1)`,
      [`%${searchTerm}%`]
    );

    return {
      demands: result.rows.map(row => new Demand(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      passengerId: this.passengerId,
      fromCity: this.fromCity,
      toCity: this.toCity,
      earliestTime: this.earliestTime,
      latestTime: this.latestTime,
      seats: this.seats,
      budgetMax: this.budgetMax,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Additional fields
      ...(this.name && { name: this.name }),
      ...(this.ratingAvg && { ratingAvg: this.ratingAvg }),
      ...(this.ratingCount && { ratingCount: this.ratingCount }),
      ...(this.responseCount !== undefined && { responseCount: this.responseCount })
    };
  }
}

module.exports = Demand;