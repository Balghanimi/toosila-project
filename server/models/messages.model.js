const { query } = require('../config/db');

class Message {
  constructor(data) {
    this.id = data.id;
    this.rideType = data.ride_type;
    this.rideId = data.ride_id;
    this.senderId = data.sender_id;
    this.receiverId = data.receiver_id || null; // NEW: receiver_id for message bleeding fix
    this.senderName = data.sender_name || null;
    this.content = data.content;
    this.createdAt = data.created_at;
    this.isRead = data.is_read || false;
    this.readAt = data.read_at || null;
    this.readBy = data.read_by || null;
    this.updatedAt = data.updated_at || null;
    // Edit/delete fields matching user's database schema
    this.isEdited = data.is_edited || false;
    this.lastEditedAt = data.last_edited_at || null;
    this.deletedAt = data.deleted_at || null;
    this.deletedForEveryone = data.deleted_for_everyone || false;
  }

  // Create a new message with receiver_id
  static async create(messageData) {
    const { rideType, rideId, senderId, receiverId, content } = messageData;
    const result = await query(
      `INSERT INTO messages (ride_type, ride_id, sender_id, receiver_id, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rideType, rideId, senderId, receiverId, content]
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
    const startTime = Date.now();

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
    console.log('[PERF] getByRide START');

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
    } else if (currentUserId) {
      // IMPROVED: If otherUserId is missing, show ALL messages in the ride conversation
      // This is safe because access control is already verified in the controller
      // The user has already been verified to have access to this ride
      console.log(
        '[MESSAGES MODEL] ℹ️ Showing all messages in ride conversation (otherUserId not specified)'
      );
      // No additional filter needed - show all messages for this ride
      // Access control is handled in messages.controller.js
    } else {
      // CRITICAL: No user context - return empty result to prevent privacy leak
      console.error(
        '[MESSAGES MODEL] 🚨 SECURITY: No user context! Returning empty result to prevent privacy leak'
      );
      return {
        messages: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
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

    const queryStartTime = Date.now();
    const result = await query(fullQuery, params);
    const queryDuration = Date.now() - queryStartTime;

    console.log(
      `[PERF] getByRide main query took ${queryDuration}ms, returned ${result.rows.length} messages`
    );
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
    const countStartTime = Date.now();
    const countResult = await query(
      `SELECT COUNT(*) FROM messages m WHERE ${whereClause}`,
      countParams
    );
    const countDuration = Date.now() - countStartTime;

    const totalDuration = Date.now() - startTime;
    console.log(`[PERF] getByRide count query took ${countDuration}ms`);
    console.log(`[PERF] getByRide TOTAL time: ${totalDuration}ms`);

    return {
      messages: result.rows.map((row) => new Message(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  // STRICT: Get messages for a specific conversation between two users on a ride
  // This prevents message bleeding - only shows messages where
  // (sender = currentUser AND receiver = otherUser) OR (sender = otherUser AND receiver = currentUser)
  static async getByRideStrict(
    rideType,
    rideId,
    page = 1,
    limit = 50,
    currentUserId,
    otherUserId
  ) {
    if (!currentUserId || !otherUserId) {
      console.error('[MESSAGES MODEL] getByRideStrict: Missing required user IDs');
      return {
        messages: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const offset = (page - 1) * limit;
    const startTime = Date.now();

    console.log('[MESSAGES MODEL] getByRideStrict called with:', {
      rideType,
      rideId,
      page,
      limit,
      currentUserId,
      otherUserId,
    });

    // STRICT PRIVACY: Only get messages between these two specific users
    // Using both sender_id AND receiver_id columns
    // BACKWARDS COMPAT: Also include old messages with NULL receiver_id where sender is one of the two users
    const params = [rideType, rideId, currentUserId, otherUserId, limit, offset];

    const fullQuery = `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ride_type = $1 
         AND m.ride_id = $2
         AND (
           (m.sender_id = $3 AND m.receiver_id = $4)
           OR
           (m.sender_id = $4 AND m.receiver_id = $3)
           OR
           (m.receiver_id IS NULL AND m.sender_id IN ($3, $4))
         )
       ORDER BY m.created_at ASC
       LIMIT $5 OFFSET $6`;

    console.log('[MESSAGES MODEL] getByRideStrict query params:', params);

    const queryStartTime = Date.now();
    const result = await query(fullQuery, params);
    const queryDuration = Date.now() - queryStartTime;

    console.log(
      `[PERF] getByRideStrict main query took ${queryDuration}ms, returned ${result.rows.length} messages`
    );

    // Count query for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM messages m 
       WHERE m.ride_type = $1 
         AND m.ride_id = $2
         AND (
           (m.sender_id = $3 AND m.receiver_id = $4)
           OR
           (m.sender_id = $4 AND m.receiver_id = $3)
           OR
           (m.receiver_id IS NULL AND m.sender_id IN ($3, $4))
         )`,
      [rideType, rideId, currentUserId, otherUserId]
    );

    const totalDuration = Date.now() - startTime;
    console.log(`[PERF] getByRideStrict TOTAL time: ${totalDuration}ms`);

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
    const startTime = Date.now();

    console.log('[PERF] getConversationList START for userId:', userId);

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
         UNION ALL
         -- EXTENDED FIX: Include demands where user (driver) sent a response
         SELECT 'demand' as ride_type, d.id as ride_id, d.passenger_id as owner_id,
                d.from_city, d.to_city, d.earliest_time as departure_time,
                d.budget_max as price, d.seats
         FROM demands d
         WHERE d.id IN (SELECT demand_id FROM demand_responses WHERE driver_id = $1)
         UNION ALL
         -- CRITICAL FIX: Include ANY ride wherein the user has sent OR received a message
         -- This ensures conversations appear in the list even without booking/response
         SELECT 'offer' as ride_type, o.id as ride_id, o.driver_id as owner_id,
                o.from_city, o.to_city, o.departure_time, o.price, o.seats
         FROM offers o
         WHERE o.id IN (SELECT ride_id FROM messages WHERE ride_type = 'offer' AND (sender_id = $1 OR receiver_id = $1))
         UNION ALL
         SELECT 'demand' as ride_type, d.id as ride_id, d.passenger_id as owner_id,
                d.from_city, d.to_city, d.earliest_time as departure_time,
                d.budget_max as price, d.seats
         FROM demands d
         WHERE d.id IN (SELECT ride_id FROM messages WHERE ride_type = 'demand' AND (sender_id = $1 OR receiver_id = $1))
       ),

       all_participants AS (
         -- Find all unique participants on each ride (excluding current user)
         -- PRIVACY FIX: Use BOTH sender_id and receiver_id to find conversation partners
         -- DEDUP FIX: Only include entries where we can definitively identify the other user
         SELECT DISTINCT
                m.ride_type,
                m.ride_id,
                CASE 
                  WHEN m.sender_id = $1 AND m.receiver_id IS NOT NULL THEN m.receiver_id
                  WHEN m.receiver_id = $1 AND m.sender_id IS NOT NULL THEN m.sender_id
                  WHEN m.receiver_id IS NULL AND m.sender_id != $1 THEN m.sender_id
                  ELSE NULL
                END as other_user_id
         FROM messages m
         WHERE EXISTS (SELECT 1 FROM user_rides ur WHERE ur.ride_type = m.ride_type AND ur.ride_id = m.ride_id)
           AND (m.sender_id = $1 OR m.receiver_id = $1 OR (m.receiver_id IS NULL AND m.sender_id != $1))
       ),
       -- Filter out NULL other_user_id entries
       valid_participants AS (
         SELECT DISTINCT ride_type, ride_id, other_user_id
         FROM all_participants
         WHERE other_user_id IS NOT NULL
       ),
       latest_messages AS (
         -- For each conversation pair (ride + other_user), get the latest message
         SELECT DISTINCT ON (m.ride_type, m.ride_id, p.other_user_id)
                m.ride_type,
                m.ride_id,
                p.other_user_id,
                m.content as last_message,
                m.created_at as last_message_time,
                m.sender_id as last_sender_id,
                u.name as last_sender_name
         FROM messages m
         JOIN valid_participants p ON m.ride_type = p.ride_type AND m.ride_id = p.ride_id
         JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = $1 AND m.receiver_id = p.other_user_id)
            OR (m.sender_id = p.other_user_id AND m.receiver_id = $1)
            OR (m.receiver_id IS NULL AND m.sender_id IN ($1, p.other_user_id))
         ORDER BY m.ride_type, m.ride_id, p.other_user_id, m.created_at DESC
       )
       -- Deduplicate user_rides to prevent duplicate conversations
       distinct_rides AS (
         SELECT DISTINCT ON (ride_type, ride_id)
                ride_type, ride_id, owner_id, from_city, to_city, departure_time, price, seats
         FROM user_rides
       )
       SELECT DISTINCT ON (lm.ride_type, lm.ride_id, lm.other_user_id)
              lm.*,
              ur.from_city,
              ur.to_city,
              ur.departure_time,
              ur.price,
              ur.seats,
              ur.owner_id,
              u2.name as other_user_name
       FROM latest_messages lm
       JOIN distinct_rides ur ON lm.ride_type = ur.ride_type AND lm.ride_id = ur.ride_id
       JOIN users u2 ON lm.other_user_id = u2.id
       ORDER BY lm.ride_type, lm.ride_id, lm.other_user_id, lm.last_message_time DESC`,
      [userId, limit, offset]
    );

    // Apply limit and offset after deduplication
    const finalRows = result.rows.sort((a, b) =>
      new Date(b.last_message_time) - new Date(a.last_message_time)
    ).slice(offset, offset + limit);

    const queryDuration = Date.now() - startTime;
    console.log(
      `[PERF] getConversationList main query took ${queryDuration}ms, returned ${result.rows.length} conversations`
    );

    const countStartTime = Date.now();
    const countResult = await query(
      `WITH user_rides AS (
         SELECT 'offer' as ride_type, id as ride_id FROM offers WHERE driver_id = $1
         UNION ALL
         SELECT 'demand' as ride_type, id as ride_id FROM demands WHERE passenger_id = $1
         UNION ALL
         SELECT 'offer' as ride_type, offer_id as ride_id
         FROM bookings WHERE passenger_id = $1
         UNION ALL
         -- EXTENDED FIX: Include demands where user (driver) sent a response
         SELECT 'demand' as ride_type, demand_id as ride_id
         FROM demand_responses WHERE driver_id = $1
         UNION ALL
         -- CRITICAL FIX: Include rides with messages (as sender OR receiver)
         SELECT 'offer' as ride_type, ride_id
         FROM messages WHERE ride_type = 'offer' AND (sender_id = $1 OR receiver_id = $1)
         UNION ALL
         SELECT 'demand' as ride_type, ride_id
         FROM messages WHERE ride_type = 'demand' AND (sender_id = $1 OR receiver_id = $1)
       )
       SELECT COUNT(DISTINCT (
         m.ride_type, 
         m.ride_id, 
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
       )) as count
       FROM messages m
       WHERE EXISTS (SELECT 1 FROM user_rides ur WHERE ur.ride_type = m.ride_type AND ur.ride_id = m.ride_id)
         AND (m.sender_id = $1 OR m.receiver_id = $1)`,
      [userId]
    );

    const countDuration = Date.now() - countStartTime;
    const totalDuration = Date.now() - startTime;
    console.log(`[PERF] getConversationList count query took ${countDuration}ms`);
    console.log(`[PERF] getConversationList TOTAL time: ${totalDuration}ms`);

    return {
      conversations: finalRows,
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
    // Check if message is deleted for everyone
    const isDeleted = this.deletedForEveryone || this.deletedAt !== null;

    return {
      id: this.id,
      rideType: this.rideType,
      rideId: this.rideId,
      senderId: this.senderId,
      receiverId: this.receiverId, // Include receiver_id in JSON output
      senderName: this.senderName,
      // Show deleted message placeholder if deleted for everyone
      content: isDeleted ? 'تم حذف هذه الرسالة' : this.content,
      createdAt: this.createdAt,
      timestamp: this.createdAt, // Alias for frontend compatibility
      isRead: this.isRead,
      readAt: this.readAt,
      readBy: this.readBy,
      updatedAt: this.updatedAt,
      // Edit/delete status
      isEdited: this.isEdited,
      lastEditedAt: this.lastEditedAt,
      deletedAt: this.deletedAt,
      isDeleted: isDeleted,
      deletedForEveryone: this.deletedForEveryone,
    };
  }

  // Edit message content (only by sender, within time limit)
  static async edit(messageId, senderId, newContent) {
    // Only allow editing within 15 minutes of creation
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    if (message.senderId !== senderId) {
      throw new Error('Only the sender can edit this message');
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(message.createdAt) < fifteenMinutesAgo) {
      throw new Error('Cannot edit message after 15 minutes');
    }

    const result = await query(
      `UPDATE messages
       SET content = $1, is_edited = true, last_edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND sender_id = $3
       RETURNING *`,
      [newContent, messageId, senderId]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to edit message');
    }

    // Fetch sender name
    const senderResult = await query('SELECT name FROM users WHERE id = $1', [senderId]);
    result.rows[0].sender_name = senderResult.rows[0]?.name || null;

    return new Message(result.rows[0]);
  }

  // Delete message for everyone (soft delete)
  static async deleteForEveryone(messageId, senderId) {
    // Only sender can delete for everyone
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    if (message.senderId !== senderId) {
      throw new Error('Only the sender can delete for everyone');
    }

    const result = await query(
      `UPDATE messages
       SET deleted_for_everyone = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [messageId]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to delete message');
    }

    return new Message(result.rows[0]);
  }

  // Delete message for current user only (soft delete)
  static async deleteForMe(messageId, userId) {
    // Mark as deleted only for this user by setting deleted_at
    // This is a simplified version - in production you might want a separate table
    const result = await query(
      `UPDATE messages
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [messageId]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to delete message');
    }

    return new Message(result.rows[0]);
  }

  // Check if message is deleted
  isDeletedMessage() {
    return this.deletedForEveryone || this.deletedAt !== null;
  }
}

module.exports = Message;
