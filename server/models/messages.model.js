const { query } = require('../config/db');

class Message {
  constructor(data) {
    this.id = data.id;
    this.rideType = data.ride_type;
    this.rideId = data.ride_id;
    this.senderId = data.sender_id;
    this.senderName = data.sender_name || null;
    this.content = data.content;
    this.createdAt = data.created_at;
    this.isRead = data.is_read || false;
    this.readAt = data.read_at || null;
    this.readBy = data.read_by || null;
    this.updatedAt = data.updated_at || null;
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

    // Fetch sender name
    const senderResult = await query('SELECT name FROM users WHERE id = $1', [senderId]);

    const messageRow = result.rows[0];
    messageRow.sender_name = senderResult.rows[0]?.name || null;

    return new Message(messageRow);
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

  // Get messages for a specific ride (with privacy filtering)
  static async getByRide(
    rideType,
    rideId,
    page = 1,
    limit = 50,
    currentUserId = null,
    otherUserId = null
  ) {
    const offset = (page - 1) * limit;

    // DEBUG LOGGING
    console.log('[MESSAGES MODEL] getByRide called with:', {
      rideType,
      rideId,
      page,
      limit,
      currentUserId,
      otherUserId,
      hasCurrentUser: !!currentUserId,
      hasOtherUser: !!otherUserId,
    });

    // PRIVACY FIX: Filter messages to only show conversation between current user and specific other user
    // This prevents users from seeing messages between other passengers and the driver
    let whereClause = 'm.ride_type = $1 AND m.ride_id = $2';
    const params = [rideType, rideId];
    let paramCount = 3;

    if (currentUserId && otherUserId) {
      // CRITICAL PRIVACY FIX: Show ONLY messages between these two specific users
      // NOT just any message from either user - must be a conversation between them
      // This prevents User A and User B's conversation from showing User C's messages
      whereClause += ` AND m.sender_id IN ($${paramCount}, $${paramCount + 1})`;
      params.push(currentUserId, otherUserId);
      paramCount += 2;
      console.log('[MESSAGES MODEL] Privacy filter applied - sender must be one of:', {
        currentUserId,
        otherUserId,
      });
    } else {
      console.log('[MESSAGES MODEL] ⚠️ WARNING: No privacy filter! Showing ALL messages for ride');
    }

    params.push(limit, offset);

    const fullQuery = `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE ${whereClause}
       ORDER BY m.created_at ASC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`;

    console.log('[MESSAGES MODEL] Executing query:', fullQuery);
    console.log('[MESSAGES MODEL] Query params:', params);

    const result = await query(fullQuery, params);

    console.log('[MESSAGES MODEL] Query returned', result.rows.length, 'messages');
    console.log(
      '[MESSAGES MODEL] Message senders:',
      result.rows.map((r) => ({
        id: r.id,
        sender_id: r.sender_id,
        sender_name: r.sender_name,
        content_preview: r.content?.substring(0, 30),
      }))
    );

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await query(
      `SELECT COUNT(*) FROM messages m WHERE ${whereClause}`,
      countParams
    );

    return {
      messages: result.rows.map((row) => new Message(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
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
      messages: result.rows.map((row) => new Message(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  // Get recent messages for a user (optimized with CTE)
  static async getRecentForUser(userId, limit = 20) {
    const result = await query(
      `WITH user_rides AS (
         SELECT 'offer' as ride_type, id as ride_id FROM offers WHERE driver_id = $1
         UNION ALL
         SELECT 'demand' as ride_type, id as ride_id FROM demands WHERE passenger_id = $1
         UNION ALL
         SELECT 'offer' as ride_type, offer_id as ride_id FROM bookings WHERE passenger_id = $1
       )
       SELECT DISTINCT ON (m.ride_type, m.ride_id)
              m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       JOIN user_rides ur ON m.ride_type = ur.ride_type AND m.ride_id = ur.ride_id
       ORDER BY m.ride_type, m.ride_id, m.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) => new Message(row));
  }

  // Get message count for a ride
  static async getCount(rideType, rideId) {
    const result = await query(
      'SELECT COUNT(*) FROM messages WHERE ride_type = $1 AND ride_id = $2',
      [rideType, rideId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get conversation list for a user (optimized with proper JOINs)
  static async getConversationList(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `WITH user_rides AS (
         -- Get all rides where user is involved
         SELECT 'offer' as ride_type, o.id as ride_id, o.driver_id as owner_id,
                o.from_city, o.to_city, o.departure_time, o.price, o.seats
         FROM offers o
         WHERE o.driver_id = $1
         UNION ALL
         SELECT 'demand' as ride_type, d.id as ride_id, d.passenger_id as owner_id,
                d.from_city, d.to_city, d.earliest_time as departure_time,
                d.budget_max as price, d.seats
         FROM demands d
         WHERE d.passenger_id = $1
         UNION ALL
         -- Include offers where user sent a booking
         SELECT 'offer' as ride_type, o.id as ride_id, o.driver_id as owner_id,
                o.from_city, o.to_city, o.departure_time, o.price, o.seats
         FROM offers o
         WHERE o.id IN (SELECT offer_id FROM bookings WHERE passenger_id = $1)
       ),
       all_senders AS (
         -- Find all unique senders on each ride (excluding current user)
         SELECT DISTINCT
                m.ride_type,
                m.ride_id,
                m.sender_id as other_user_id
         FROM messages m
         WHERE EXISTS (SELECT 1 FROM user_rides ur WHERE ur.ride_type = m.ride_type AND ur.ride_id = m.ride_id)
           AND m.sender_id != $1
       ),
       latest_messages AS (
         -- For each conversation pair (ride + other_user), get the latest message
         SELECT DISTINCT ON (m.ride_type, m.ride_id, s.other_user_id)
                m.ride_type,
                m.ride_id,
                s.other_user_id,
                m.content as last_message,
                m.created_at as last_message_time,
                m.sender_id as last_sender_id,
                u.name as last_sender_name
         FROM messages m
         JOIN all_senders s ON m.ride_type = s.ride_type AND m.ride_id = s.ride_id
         JOIN users u ON m.sender_id = u.id
         WHERE m.sender_id IN ($1, s.other_user_id)
         ORDER BY m.ride_type, m.ride_id, s.other_user_id, m.created_at DESC
       )
       SELECT lm.*,
              ur.from_city,
              ur.to_city,
              ur.departure_time,
              ur.price,
              ur.seats,
              ur.owner_id,
              u2.name as other_user_name
       FROM latest_messages lm
       JOIN user_rides ur ON lm.ride_type = ur.ride_type AND lm.ride_id = ur.ride_id
       JOIN users u2 ON lm.other_user_id = u2.id
       ORDER BY lm.last_message_time DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `WITH user_rides AS (
         SELECT 'offer' as ride_type, id as ride_id FROM offers WHERE driver_id = $1
         UNION ALL
         SELECT 'demand' as ride_type, id as ride_id FROM demands WHERE passenger_id = $1
         UNION ALL
         SELECT 'offer' as ride_type, offer_id as ride_id
         FROM bookings WHERE passenger_id = $1
       )
       SELECT COUNT(DISTINCT (m.ride_type, m.ride_id, m.sender_id)) as count
       FROM messages m
       WHERE EXISTS (SELECT 1 FROM user_rides ur WHERE ur.ride_type = m.ride_type AND ur.ride_id = m.ride_id)
         AND m.sender_id != $1`,
      [userId]
    );

    return {
      conversations: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  // Mark a message as read
  static async markAsRead(messageId, userId) {
    const result = await query(
      `UPDATE messages
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP, read_by = $2
       WHERE id = $1
       RETURNING *`,
      [messageId, userId]
    );
    return result.rows.length > 0 ? new Message(result.rows[0]) : null;
  }

  // Mark all messages in a ride conversation as read
  static async markRideMessagesAsRead(rideType, rideId, userId) {
    const result = await query(
      `UPDATE messages
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP, read_by = $3
       WHERE ride_type = $1 AND ride_id = $2 AND sender_id != $3 AND is_read = FALSE
       RETURNING *`,
      [rideType, rideId, userId]
    );
    return result.rows.map((row) => new Message(row));
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    const result = await query(
      `WITH user_rides AS (
         -- Get all rides where user is involved
         SELECT 'offer' as ride_type, id as ride_id FROM offers WHERE driver_id = $1
         UNION ALL
         SELECT 'demand' as ride_type, id as ride_id FROM demands WHERE passenger_id = $1
         UNION ALL
         SELECT 'offer' as ride_type, offer_id as ride_id
         FROM bookings WHERE passenger_id = $1 AND status IN ('pending', 'accepted')
         UNION ALL
         SELECT 'demand' as ride_type, demand_id as ride_id
         FROM demand_responses WHERE driver_id = $1 AND status IN ('pending', 'accepted')
       )
       SELECT COUNT(*)::int as count
       FROM messages m
       WHERE m.sender_id != $1
         AND m.is_read = FALSE
         AND EXISTS (
           SELECT 1 FROM user_rides ur
           WHERE ur.ride_type = m.ride_type AND ur.ride_id = m.ride_id
         )`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get unread count for a specific ride
  static async getUnreadCountForRide(rideType, rideId, userId) {
    const result = await query(
      `SELECT COUNT(*)::int as count
       FROM messages
       WHERE ride_type = $1 AND ride_id = $2 AND sender_id != $3 AND is_read = FALSE`,
      [rideType, rideId, userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get conversation between two users (deprecated - use ride-based instead)
  static async getConversation(userId1, userId2, page = 1, limit = 50) {
    // This is deprecated in favor of ride-based messaging
    return {
      messages: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      rideType: this.rideType,
      rideId: this.rideId,
      senderId: this.senderId,
      senderName: this.senderName,
      content: this.content,
      createdAt: this.createdAt,
      timestamp: this.createdAt, // Alias for frontend compatibility
      isRead: this.isRead,
      readAt: this.readAt,
      readBy: this.readBy,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Message;
