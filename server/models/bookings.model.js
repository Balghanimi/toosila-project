const { query } = require('../config/db');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.offerId = data.offer_id;
    this.passengerId = data.passenger_id;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new booking
  static async create(bookingData) {
    const { offerId, passengerId } = bookingData;
    const result = await query(
      `INSERT INTO bookings (offer_id, passenger_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [offerId, passengerId]
    );
    return new Booking(result.rows[0]);
  }

  // Find booking by ID
  static async findById(id) {
    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats,
              u1.name as passenger_name, u2.name as driver_name
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       JOIN users u1 ON b.passenger_id = u1.id
       JOIN users u2 ON o.driver_id = u2.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows.length > 0 ? new Booking(result.rows[0]) : null;
  }

  // Get all bookings with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.passengerId) {
      whereClause += ` AND b.passenger_id = $${paramCount}`;
      values.push(filters.passengerId);
      paramCount++;
    }

    if (filters.driverId) {
      whereClause += ` AND o.driver_id = $${paramCount}`;
      values.push(filters.driverId);
      paramCount++;
    }

    if (filters.status) {
      whereClause += ` AND b.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.offerId) {
      whereClause += ` AND b.offer_id = $${paramCount}`;
      values.push(filters.offerId);
      paramCount++;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats,
              u1.name as passenger_name, u2.name as driver_name
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       JOIN users u1 ON b.passenger_id = u1.id
       JOIN users u2 ON o.driver_id = u2.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       ${whereClause}`,
      values.slice(0, -2)
    );

    return {
      bookings: result.rows.map(row => new Booking(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Update booking
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
      `UPDATE bookings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return new Booking(result.rows[0]);
  }

  // Get bookings sent by passenger
  static async getSentBookings(passengerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats,
              u.name as driver_name
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       JOIN users u ON o.driver_id = u.id
       WHERE b.passenger_id = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [passengerId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM bookings WHERE passenger_id = $1',
      [passengerId]
    );

    return {
      bookings: result.rows.map(row => new Booking(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get bookings received by driver
  static async getReceivedBookings(driverId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats,
              u.name as passenger_name
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       JOIN users u ON b.passenger_id = u.id
       WHERE o.driver_id = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [driverId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       WHERE o.driver_id = $1`,
      [driverId]
    );

    return {
      bookings: result.rows.map(row => new Booking(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Check if booking exists
  static async exists(offerId, passengerId) {
    const result = await query(
      'SELECT id FROM bookings WHERE offer_id = $1 AND passenger_id = $2',
      [offerId, passengerId]
    );
    return result.rows.length > 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      offerId: this.offerId,
      passengerId: this.passengerId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Booking;