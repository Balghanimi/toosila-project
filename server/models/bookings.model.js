const { query } = require('../config/db');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.offerId = data.offer_id;
    this.passengerId = data.passenger_id;
    this.seats = data.seats || 1;
    this.message = data.message;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    // Store joined offer data for frontend compatibility
    this.fromCity = data.from_city;
    this.toCity = data.to_city;
    this.departureTime = data.departure_time;
    this.price = data.price;
    this.offerSeats = data.offer_seats;
    this.driverName = data.driver_name;
    this.driverId = data.driver_id;
    this.driverEmail = data.driver_email;
    this.driverPhone = data.driver_phone;
    this.passengerName = data.passenger_name;
    this.passengerEmail = data.passenger_email;
    this.passengerPhone = data.passenger_phone;
    this.totalPrice = data.total_price;
  }

  // Create a new booking
  static async create(bookingData) {
    const { offerId, passengerId, seats = 1, message } = bookingData;
    const result = await query(
      `INSERT INTO bookings (offer_id, passenger_id, seats, message, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [offerId, passengerId, seats, message || null]
    );
    return new Booking(result.rows[0]);
  }

  // Find booking by ID
  static async findById(id) {
    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats as offer_seats,
              o.driver_id, u1.name as passenger_name, u1.email as passenger_email, u1.phone as passenger_phone,
              u2.name as driver_name, u2.email as driver_email, u2.phone as driver_phone
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
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats as offer_seats,
              o.driver_id, u1.name as passenger_name, u1.email as passenger_email, u1.phone as passenger_phone,
              u2.name as driver_name, u2.email as driver_email, u2.phone as driver_phone,
              COUNT(*) OVER() as total_count
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       JOIN users u1 ON b.passenger_id = u1.id
       JOIN users u2 ON o.driver_id = u2.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return {
      bookings: result.rows.map(row => new Booking(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
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

  // Update booking status
  async updateStatus(status, totalPrice = null) {
    const updateData = { status };
    if (totalPrice !== null) {
      updateData.total_price = totalPrice;
    }
    return this.update(updateData);
  }

  // Get bookings sent by passenger (with full offer and driver details)
  static async getSentBookings(passengerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats as offer_seats,
              o.driver_id, u.name as driver_name, u.email as driver_email, u.phone as driver_phone
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

  // Get bookings received by driver (with full passenger details)
  static async getReceivedBookings(driverId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT b.*, o.from_city, o.to_city, o.departure_time, o.price, o.seats as offer_seats,
              o.driver_id, u.name as passenger_name, u.id as passenger_id, u.email as passenger_email, u.phone as passenger_phone
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

  // Convert to JSON with nested structure expected by frontend
  toJSON() {
    const json = {
      id: this.id,
      offerId: this.offerId,
      passengerId: this.passengerId,
      seats: this.seats,
      message: this.message,
      status: this.status,
      totalPrice: this.totalPrice,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Add nested offer object if data exists
    if (this.fromCity || this.toCity || this.departureTime || this.price) {
      json.offer = {
        id: this.offerId,
        fromCity: this.fromCity,
        toCity: this.toCity,
        departureTime: this.departureTime,
        price: this.price,
        seats: this.offerSeats,
      };

      // Add driver info to offer if available
      if (this.driverName || this.driverId) {
        json.offer.driver = {
          id: this.driverId,
          name: this.driverName,
          email: this.driverEmail,
          phone: this.driverPhone,
        };
      }
    }

    // Add nested user (passenger) object if data exists
    if (this.passengerName || this.passengerEmail) {
      json.user = {
        id: this.passengerId,
        name: this.passengerName,
        email: this.passengerEmail,
        phone: this.passengerPhone,
      };
    }

    return json;
  }
}

module.exports = Booking;
