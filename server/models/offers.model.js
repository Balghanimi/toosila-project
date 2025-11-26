const { query } = require('../config/db');

class Offer {
  constructor(data) {
    this.id = data.id;
    this.driverId = data.driver_id;
    this.fromCity = data.from_city;
    this.toCity = data.to_city;
    this.departureTime = data.departure_time;
    this.seats = data.seats;
    this.availableSeats = data.available_seats !== undefined ? parseInt(data.available_seats) : data.seats;
    this.price = parseFloat(data.price);
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    // Driver information (if joined)
    this.name = data.name;
    this.ratingAvg = data.rating_avg;
    this.ratingCount = data.rating_count;
  }

  // Create a new offer
  static async create(offerData) {
    const { driverId, fromCity, toCity, departureTime, seats, price } = offerData;
    const result = await query(
      `INSERT INTO offers (driver_id, from_city, to_city, departure_time, seats, price, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [driverId, fromCity, toCity, departureTime, seats, price]
    );
    return new Offer(result.rows[0]);
  }

  // Find offer by ID
  static async findById(id) {
    const result = await query(
      `SELECT o.*, u.name, u.rating_avg, u.rating_count,
              (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0))::int as available_seats
       FROM offers o
       JOIN users u ON o.driver_id = u.id
       LEFT JOIN bookings b ON o.id = b.offer_id
       WHERE o.id = $1
       GROUP BY o.id, u.name, u.rating_avg, u.rating_count`,
      [id]
    );
    return result.rows.length > 0 ? new Offer(result.rows[0]) : null;
  }

  // Get all offers with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE o.is_active = true';
    const values = [];
    let paramCount = 1;

    if (filters.fromCity) {
      whereClause += ` AND o.from_city ILIKE $${paramCount}`;
      values.push(`%${filters.fromCity}%`);
      paramCount++;
    }

    if (filters.toCity) {
      whereClause += ` AND o.to_city ILIKE $${paramCount}`;
      values.push(`%${filters.toCity}%`);
      paramCount++;
    }

    if (filters.minPrice) {
      whereClause += ` AND o.price >= $${paramCount}`;
      values.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice) {
      whereClause += ` AND o.price <= $${paramCount}`;
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.driverId) {
      whereClause += ` AND o.driver_id = $${paramCount}`;
      values.push(filters.driverId);
      paramCount++;
    }

    if (filters.departureDate) {
      whereClause += ` AND DATE(o.departure_time) = $${paramCount}`;
      values.push(filters.departureDate);
      paramCount++;
    }

    if (filters.minSeats) {
      whereClause += ` AND o.seats >= $${paramCount}`;
      values.push(filters.minSeats);
      paramCount++;
    }

    // Determine ORDER BY clause
    let orderBy = 'o.departure_time ASC';
    if (filters.sortBy) {
      switch(filters.sortBy) {
        case 'price_asc':
          orderBy = 'o.price ASC';
          break;
        case 'price_desc':
          orderBy = 'o.price DESC';
          break;
        case 'rating':
          orderBy = 'u.rating_avg DESC NULLS LAST';
          break;
        case 'seats':
          orderBy = 'o.seats DESC';
          break;
        case 'date':
        default:
          orderBy = 'o.departure_time ASC';
      }
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT o.*, u.name, u.rating_avg, u.rating_count,
              (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0))::int as available_seats
       FROM offers o
       JOIN users u ON o.driver_id = u.id
       LEFT JOIN bookings b ON o.id = b.offer_id
       ${whereClause}
       GROUP BY o.id, u.name, u.rating_avg, u.rating_count
       HAVING (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0)) > 0
       ORDER BY ${orderBy}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM offers o ${whereClause}`,
      values.slice(0, -2)
    );

    return {
      offers: result.rows.map(row => new Offer(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Update offer
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
      `UPDATE offers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return new Offer(result.rows[0]);
  }

  // Update seats count
  async updateSeats(newSeats) {
    const result = await query(
      'UPDATE offers SET seats = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newSeats, this.id]
    );
    return new Offer(result.rows[0]);
  }

  // Deactivate offer
  async deactivate() {
    const result = await query(
      'UPDATE offers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [this.id]
    );
    return new Offer(result.rows[0]);
  }

  // Get offers by driver
  static async findByDriverId(driverId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT * FROM offers 
       WHERE driver_id = $1 
       ORDER BY departure_time ASC
       LIMIT $2 OFFSET $3`,
      [driverId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM offers WHERE driver_id = $1',
      [driverId]
    );

    return {
      offers: result.rows.map(row => new Offer(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get offer statistics
  static async getStats(offerId) {
    const result = await query(
      `SELECT 
        (SELECT COUNT(*) FROM bookings WHERE offer_id = $1) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE offer_id = $1 AND status = 'accepted') as accepted_bookings,
        (SELECT AVG(rating) FROM ratings r 
         WHERE r.ride_id = $1) as average_rating`,
      [offerId]
    );
    return result.rows[0];
  }

  // Search offers
  static async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT o.*, u.name, u.rating_avg, u.rating_count,
              (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0))::int as available_seats
       FROM offers o
       JOIN users u ON o.driver_id = u.id
       LEFT JOIN bookings b ON o.id = b.offer_id
       WHERE o.is_active = true
       AND (o.from_city ILIKE $1 OR o.to_city ILIKE $1)
       GROUP BY o.id, u.name, u.rating_avg, u.rating_count
       HAVING (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0)) > 0
       ORDER BY o.departure_time ASC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM offers 
       WHERE is_active = true 
       AND (from_city ILIKE $1 OR to_city ILIKE $1)`,
      [`%${searchTerm}%`]
    );

    return {
      offers: result.rows.map(row => new Offer(row)),
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
      driverId: this.driverId,
      fromCity: this.fromCity,
      toCity: this.toCity,
      departureTime: this.departureTime,
      seats: this.seats,
      availableSeats: this.availableSeats,
      price: this.price,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      ratingAvg: this.ratingAvg,
      ratingCount: this.ratingCount
    };
  }
}

module.exports = Offer;

