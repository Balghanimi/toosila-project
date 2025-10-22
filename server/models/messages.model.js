const { query } = require('../config/db');

class Message {
  constructor(data) {
    this.id = data.id;
    this.rideType = data.ride_type;
    this.rideId = data.ride_id;
    this.senderId = data.sender_id;
    this.content = data.content;
    this.createdAt = data.created_at;
  }

  // Create a new message
  static async create(messageData) {
    const { rideType, rideId, senderId, content } = messageData;
    const result = await query(
      `INSERT INTO messages (ride_type, ride_id, sender_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [rideType, rideId, senderId, content]
    );
    return new Message(result.rows[0]);
  }

  // Find message by ID
  static async findById(id) {
    const result = await query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows.length > 0 ? new Message(result.rows[0]) : null;
  }

  // Get messages for a specific ride
  static async getByRide(rideType, rideId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ride_type = $1 AND m.ride_id = $2
       ORDER BY m.created_at ASC
       LIMIT $3 OFFSET $4`,
      [rideType, rideId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM messages WHERE ride_type = $1 AND ride_id = $2',
      [rideType, rideId]
    );

    return {
      messages: result.rows.map(row => new Message(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get all messages with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.senderId) {
      whereClause += ` AND m.sender_id = $${paramCount}`;
      values.push(filters.senderId);
      paramCount++;
    }

    if (filters.rideType) {
      whereClause += ` AND m.ride_type = $${paramCount}`;
      values.push(filters.rideType);
      paramCount++;
    }

    if (filters.rideId) {
      whereClause += ` AND m.ride_id = $${paramCount}`;
      values.push(filters.rideId);
      paramCount++;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM messages m ${whereClause}`,
      values.slice(0, -2)
    );

    return {
      messages: result.rows.map(row => new Message(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get recent messages for a user
  static async getRecentForUser(userId, limit = 20) {
    const result = await query(
      `SELECT DISTINCT ON (m.ride_type, m.ride_id) 
              m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ride_id IN (
         SELECT DISTINCT ride_id FROM messages 
         WHERE sender_id = $1 OR ride_id IN (
           SELECT id FROM offers WHERE driver_id = $1
           UNION
           SELECT id FROM demands WHERE passenger_id = $1
         )
       )
       ORDER BY m.ride_type, m.ride_id, m.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => new Message(row));
  }

  // Get message count for a ride
  static async getCount(rideType, rideId) {
    const result = await query(
      'SELECT COUNT(*) FROM messages WHERE ride_type = $1 AND ride_id = $2',
      [rideType, rideId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get conversation list for a user
  static async getConversationList(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT DISTINCT ON (m.ride_type, m.ride_id)
              m.ride_type,
              m.ride_id,
              m.content as last_message,
              m.created_at as last_message_time,
              u.name as other_user_name,
              u.id as other_user_id
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ride_id IN (
         SELECT DISTINCT ride_id FROM messages
         WHERE sender_id = $1 OR ride_id IN (
           SELECT id FROM offers WHERE driver_id = $1
           UNION
           SELECT id FROM demands WHERE passenger_id = $1
         )
       )
       ORDER BY m.ride_type, m.ride_id, m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as count
       FROM (
         SELECT DISTINCT ride_type, ride_id
         FROM messages
         WHERE ride_id IN (
           SELECT DISTINCT ride_id FROM messages
           WHERE sender_id = $1 OR ride_id IN (
             SELECT id FROM offers WHERE driver_id = $1
             UNION
             SELECT id FROM demands WHERE passenger_id = $1
           )
         )
       ) AS distinct_conversations`,
      [userId]
    );

    return {
      conversations: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  // Get conversation between two users (stub for compatibility)
  static async getConversation(userId1, userId2, page = 1, limit = 50) {
    // This is a placeholder - implement based on your schema
    return {
      messages: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }

  // Get unread count for a user (stub for compatibility)
  static async getUnreadCount(userId) {
    // This is a placeholder - implement based on your schema
    return 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      rideType: this.rideType,
      rideId: this.rideId,
      senderId: this.senderId,
      content: this.content,
      createdAt: this.createdAt
    };
  }
}

module.exports = Message;