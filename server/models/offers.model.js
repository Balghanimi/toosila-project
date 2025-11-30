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
    // User booking status (if queried with currentUserId)
    this.userHasBooking = data.user_has_booking || false;
    this.userBookingStatus = data.user_booking_status || null;
    this.userBookingId = data.user_booking_id || null;
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

  // Find offer by ID (optionally with user booking status)
  static async findById(id, currentUserId = null) {
    let sql;
    let params;

    if (currentUserId) {
      // Include user's booking status if logged in
      sql = `SELECT o.*, u.name, u.rating_avg, u.rating_count,
              (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0))::int as available_seats,
              CASE WHEN ub.id IS NOT NULL THEN true ELSE false END as user_has_booking,
              ub.status as user_booking_status,
              ub.id as user_booking_id
       FROM offers o
       JOIN users u ON o.driver_id = u.id
       LEFT JOIN bookings b ON o.id = b.offer_id
       LEFT JOIN bookings ub ON o.id = ub.offer_id AND ub.passenger_id = $2 AND ub.status IN ('pending', 'confirmed')
       WHERE o.id = $1
       GROUP BY o.id, u.name, u.rating_avg, u.rating_count, ub.id, ub.status`;
      params = [id, currentUserId];
    } else {
      // No user - just get offer details
      sql = `SELECT o.*, u.name, u.rating_avg, u.rating_count,
              (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0))::int as available_seats
       FROM offers o
       JOIN users u ON o.driver_id = u.id
       LEFT JOIN bookings b ON o.id = b.offer_id
       WHERE o.id = $1
       GROUP BY o.id, u.name, u.rating_avg, u.rating_count`;
      params = [id];
    }

    const result = await query(sql, params);
    return result.rows.length > 0 ? new Offer(result.rows[0]) : null;
  }

  // Get all offers with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}, currentUserId = null) {
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
    // Default: newest created first (most recent posts at top)
    let orderBy = 'o.created_at DESC, o.departure_time ASC';
    if (filters.sortBy) {
      switch(filters.sortBy) {
        case 'price_asc':
          orderBy = 'o.price ASC, o.created_at DESC';
          break;
        case 'price_desc':
          orderBy = 'o.price DESC, o.created_at DESC';
          break;
        case 'rating':
          orderBy = 'u.rating_avg DESC NULLS LAST, o.created_at DESC';
          break;
        case 'seats':
          orderBy = 'o.seats DESC, o.created_at DESC';
          break;
        case 'departure':
          orderBy = 'o.departure_time ASC, o.created_at DESC';
          break;
        case 'newest':
        default:
          orderBy = 'o.created_at DESC, o.departure_time ASC';
      }
    }

    // Save the filter values for the count query (before adding currentUserId)
    const filterValues = [...values];

    // Build the query with optional user booking status
    let userBookingJoin = '';
    let userBookingSelect = '';
    let userBookingGroupBy = '';

    if (currentUserId) {
      // Add user booking status fields with parameterized query
      userBookingSelect = `,
              CASE WHEN ub.id IS NOT NULL THEN true ELSE false END as user_has_booking,
              ub.status as user_booking_status,
              ub.id as user_booking_id`;
      userBookingJoin = ` LEFT JOIN bookings ub ON o.id = ub.offer_id AND ub.passenger_id = $${paramCount} AND ub.status IN ('pending', 'confirmed')`;
      values.push(currentUserId);
      paramCount++;
      userBookingGroupBy = ', ub.id, ub.status';
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT o.*, u.name, u.rating_avg, u.rating_count,
              (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0))::int as available_seats${userBookingSelect}
       FROM offers o
       JOIN users u ON o.driver_id = u.id
       LEFT JOIN bookings b ON o.id = b.offer_id${userBookingJoin}
       ${whereClause}
       GROUP BY o.id, u.name, u.rating_avg, u.rating_count${userBookingGroupBy}
       HAVING (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0)) > 0
       ORDER BY ${orderBy}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    // Count only offers with available seats (matching the HAVING clause)
    // Use filterValues which doesn't include currentUserId or limit/offset
    const countResult = await query(
      `SELECT COUNT(*) FROM (
        SELECT o.id
        FROM offers o
        LEFT JOIN bookings b ON o.id = b.offer_id
        ${whereClause}
        GROUP BY o.id
        HAVING (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0)) > 0
      ) as available_offers`,
      filterValues
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
       ORDER BY o.created_at DESC, o.departure_time ASC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );

    // Count only offers with available seats (matching the HAVING clause)
    const countResult = await query(
      `SELECT COUNT(*) FROM (
        SELECT o.id
        FROM offers o
        LEFT JOIN bookings b ON o.id = b.offer_id
        WHERE o.is_active = true
        AND (o.from_city ILIKE $1 OR o.to_city ILIKE $1)
        GROUP BY o.id
        HAVING (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'confirmed')), 0)) > 0
      ) as available_offers`,
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
      ratingCount: this.ratingCount,
      // User booking status (only included when queried with currentUserId)
      userHasBooking: this.userHasBooking,
      userBookingStatus: this.userBookingStatus,
      userBookingId: this.userBookingId
    };
  }
}

module.exports = Offer;

