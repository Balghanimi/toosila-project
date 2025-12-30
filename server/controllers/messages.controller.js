const Message = require('../models/messages.model');
const { asyncHandler, AppError } = require('../middlewares/error');
const { notifyNewMessage } = require('../socket');

// Send a new message (ride-based)
const sendMessage = asyncHandler(async (req, res) => {
  const { rideType, rideId, content, receiverId } = req.body;

  // Validate ride type
  if (!['offer', 'demand'].includes(rideType)) {
    throw new AppError('Invalid ride type. Must be "offer" or "demand"', 400);
  }

  // Verify the ride exists and determine receiver_id
  const { query } = require('../config/db');
  let rideCheck;
  let determinedReceiverId = receiverId || null;

  if (rideType === 'offer') {
    // For offers: check if offer exists and is active
    rideCheck = await query(
      `SELECT o.id, o.driver_id, o.from_city, o.to_city
       FROM offers o
       WHERE o.id = $1 AND o.is_active = true`,
      [rideId]
    );

    if (rideCheck.rows.length > 0) {
      const ride = rideCheck.rows[0];

      // RECEIVER_ID LOGIC: Determine receiver based on who is sending
      if (req.user.id === ride.driver_id) {
        // Sender is driver (ride owner) - receiver should be provided or found from existing messages
        if (!determinedReceiverId) {
          // Find the other user from existing conversation
          const existingConvo = await query(
            `SELECT sender_id FROM messages
             WHERE ride_type = 'offer' AND ride_id = $1 AND sender_id != $2
             ORDER BY created_at DESC LIMIT 1`,
            [rideId, req.user.id]
          );
          if (existingConvo.rows.length > 0) {
            determinedReceiverId = existingConvo.rows[0].sender_id;
          } else {
            throw new AppError('You cannot start a conversation on your own offer', 400);
          }
        }
      } else {
        // Sender is passenger - receiver is the driver (ride owner)
        determinedReceiverId = ride.driver_id;
      }
    }
  } else {
    // SECURITY FIX: For demands, verify user has legitimate access
    // User must be either the passenger OR have a demand_response
    rideCheck = await query(
      `SELECT d.id, d.passenger_id, d.from_city, d.to_city
       FROM demands d
       WHERE d.id = $1 AND (
         d.passenger_id = $2 OR
         EXISTS (
           SELECT 1 FROM demand_responses
           WHERE demand_id = $1 AND driver_id = $2
         )
       )`,
      [rideId, req.user.id]
    );

    if (rideCheck.rows.length > 0) {
      const ride = rideCheck.rows[0];

      // RECEIVER_ID LOGIC for demand
      if (req.user.id === ride.passenger_id) {
        // Sender is passenger (ride owner) - receiver should be provided or found
        if (!determinedReceiverId) {
          const existingConvo = await query(
            `SELECT sender_id FROM messages
             WHERE ride_type = 'demand' AND ride_id = $1 AND sender_id != $2
             ORDER BY created_at DESC LIMIT 1`,
            [rideId, req.user.id]
          );
          if (existingConvo.rows.length > 0) {
            determinedReceiverId = existingConvo.rows[0].sender_id;
          }
        }
      } else {
        // Sender is driver - receiver is the passenger (ride owner)
        determinedReceiverId = ride.passenger_id;
      }
    }
  }

  if (rideCheck.rows.length === 0) {
    throw new AppError('Ride not found', 404);
  }

  // Validate receiver_id is set
  if (!determinedReceiverId) {
    throw new AppError('Could not determine message receiver', 400);
  }

  console.log('[MESSAGES] Creating message with receiver_id:', determinedReceiverId, 'sender_id:', req.user.id);

  // Create message with receiver_id
  const message = await Message.create({
    rideType,
    rideId,
    senderId: req.user.id,
    receiverId: determinedReceiverId,
    content,
  });

  // PERFORMANCE FIX: Send response immediately, then send notifications in background
  res.status(201).json({
    message: 'Message sent successfully',
    messageData: message.toJSON(),
  });

  // Send notifications in background (non-blocking)
  setImmediate(async () => {
    try {
      const io = req.app.get('io');
      if (!io) return;

      let participantsQuery;

      if (rideType === 'offer') {
        // Notify driver and all users who have messaged about this offer
        participantsQuery = await query(
          `SELECT DISTINCT u.id, u.name
           FROM users u
           WHERE u.id != $1 AND (
             u.id = (SELECT driver_id FROM offers WHERE id = $2) OR
             u.id IN (SELECT passenger_id FROM bookings WHERE offer_id = $2 AND status IN ('pending', 'accepted')) OR
             u.id IN (SELECT DISTINCT sender_id FROM messages WHERE ride_type = 'offer' AND ride_id = $2)
           )`,
          [req.user.id, rideId]
        );
      } else {
        // Notify passenger and all drivers who have interacted
        participantsQuery = await query(
          `SELECT DISTINCT u.id, u.name
           FROM users u
           WHERE u.id != $1 AND (
             u.id = (SELECT passenger_id FROM demands WHERE id = $2) OR
             u.id IN (SELECT driver_id FROM demand_responses WHERE demand_id = $2 AND status IN ('pending', 'accepted')) OR
             u.id IN (SELECT DISTINCT sender_id FROM messages WHERE ride_type = 'demand' AND ride_id = $2)
           )`,
          [req.user.id, rideId]
        );
      }

      // PRIVACY FIX: Only notify the specific receiver, not all participants
      notifyNewMessage(io, determinedReceiverId, {
        ...message.toJSON(),
        receiverId: determinedReceiverId,
        senderName: req.user.name || `${req.user.firstName} ${req.user.lastName}`,
        ride: rideCheck.rows[0],
      });
    } catch (error) {
      console.error('[MESSAGES] Error sending notifications:', error);
      // Don't throw - notifications are non-critical
    }
  });
});

// Get messages for a specific ride - STRICT FILTERING by sender_id and receiver_id
const getRideMessages = asyncHandler(async (req, res) => {
  const { rideType, rideId } = req.params;
  const { page = 1, limit = 50, other_user_id } = req.query;

  // Validate ride type
  if (!['offer', 'demand'].includes(rideType)) {
    throw new AppError('Invalid ride type. Must be "offer" or "demand"', 400);
  }

  // STRICT PRIVACY: other_user_id is REQUIRED to prevent message bleeding
  if (!other_user_id) {
    console.warn('[MESSAGES CONTROLLER] ⚠️ other_user_id not provided - returning empty for privacy');
    return res.json({
      messages: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: 0,
    });
  }

  // Verify user has access to this ride
  const { query } = require('../config/db');
  let accessCheck;

  if (rideType === 'offer') {
    // SECURITY: User must be the driver, have a booking, or have participated in this conversation
    accessCheck = await query(
      `SELECT 1 FROM offers o
       WHERE o.id = $1 AND o.is_active = true AND (
         o.driver_id = $2 OR
         EXISTS (SELECT 1 FROM bookings WHERE offer_id = $1 AND passenger_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'offer' AND ride_id = $1 AND (sender_id = $2 OR receiver_id = $2))
       )`,
      [rideId, req.user.id]
    );

    if (accessCheck.rows.length === 0) {
      throw new AppError('Access denied to this conversation', 403);
    }
  } else {
    // SECURITY: User must be the passenger, have a response, or have participated in messages
    accessCheck = await query(
      `SELECT 1 FROM demands d
       WHERE d.id = $1 AND (
         d.passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'demand' AND ride_id = $1 AND (sender_id = $2 OR receiver_id = $2))
       )`,
      [rideId, req.user.id]
    );

    if (accessCheck.rows.length === 0) {
      throw new AppError('Access denied to this conversation', 403);
    }
  }

  // STRICT PRIVACY FIX: Filter messages by BOTH sender_id AND receiver_id
  const currentUserName =
    req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'User';

  console.log('[MESSAGES CONTROLLER] getRideMessages called with STRICT filtering:', {
    rideType,
    rideId,
    page,
    limit,
    currentUserId: req.user.id,
    currentUserName,
    other_user_id,
  });

  const result = await Message.getByRideStrict(
    rideType,
    rideId,
    parseInt(page),
    parseInt(limit),
    req.user.id,
    other_user_id
  );

  console.log('[MESSAGES CONTROLLER] Returning', result.messages.length, 'messages to client');

  res.json(result);
});

// Get conversation between two users (deprecated - use ride-based instead)
const getConversation = asyncHandler(async (req, res) => {
  throw new AppError(
    'This endpoint is deprecated. Use GET /messages/:rideType/:rideId instead',
    410
  );
});

// Get user's conversation list
const getConversationList = asyncHandler(async (req, res) => {
  // FIX: Increased default limit to 50 to show more conversations
  const { page = 1, limit = 50 } = req.query;

  const result = await Message.getConversationList(req.user.id, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get recent messages for user
const getRecentMessages = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const messages = await Message.getRecentForUser(req.user.id, parseInt(limit));

  res.json({
    messages,
    total: messages.length,
  });
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Check if user has access to this message
  const { query } = require('../config/db');
  let accessCheck;

  if (message.rideType === 'offer') {
    accessCheck = await query(
      `SELECT 1 FROM offers WHERE id = $1 AND (
         driver_id = $2 OR
         EXISTS (SELECT 1 FROM bookings WHERE offer_id = $1 AND passenger_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'offer' AND ride_id = $1 AND sender_id = $2)
       )`,
      [message.rideId, req.user.id]
    );
  } else {
    // FIX: Include message participation in access check
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'demand' AND ride_id = $1 AND sender_id = $2)
       )`,
      [message.rideId, req.user.id]
    );
  }

  if (accessCheck.rows.length === 0) {
    throw new AppError('Access denied', 403);
  }

  const updatedMessage = await Message.markAsRead(id, req.user.id);

  res.json({
    message: 'Message marked as read',
    messageData: updatedMessage.toJSON(),
  });
});

// Mark all messages in a ride conversation as read
const markConversationAsRead = asyncHandler(async (req, res) => {
  const { rideType, rideId } = req.params;

  // Validate ride type
  if (!['offer', 'demand'].includes(rideType)) {
    throw new AppError('Invalid ride type. Must be "offer" or "demand"', 400);
  }

  // Verify user has access to this ride
  const { query } = require('../config/db');
  let accessCheck;

  if (rideType === 'offer') {
    accessCheck = await query(
      `SELECT 1 FROM offers WHERE id = $1 AND (
         driver_id = $2 OR
         EXISTS (SELECT 1 FROM bookings WHERE offer_id = $1 AND passenger_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'offer' AND ride_id = $1 AND sender_id = $2)
       )`,
      [rideId, req.user.id]
    );
  } else {
    // FIX: Include message participation in access check
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'demand' AND ride_id = $1 AND sender_id = $2)
       )`,
      [rideId, req.user.id]
    );
  }

  if (accessCheck.rows.length === 0) {
    throw new AppError('Access denied to this conversation', 403);
  }

  const updatedMessages = await Message.markRideMessagesAsRead(rideType, rideId, req.user.id);

  res.json({
    message: 'Conversation marked as read',
    updatedCount: updatedMessages.length,
  });
});

// Get unread message count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.getUnreadCount(req.user.id);

  res.json({
    unreadCount: count,
  });
});

// Get message by ID
const getMessageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Verify user has access to this message
  const { query } = require('../config/db');
  let accessCheck;

  if (message.rideType === 'offer') {
    accessCheck = await query(
      `SELECT 1 FROM offers WHERE id = $1 AND (
         driver_id = $2 OR
         EXISTS (SELECT 1 FROM bookings WHERE offer_id = $1 AND passenger_id = $2)
       )`,
      [message.rideId, req.user.id]
    );
  } else {
    // FIX: Include message participation in access check
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2) OR
         EXISTS (SELECT 1 FROM messages WHERE ride_type = 'demand' AND ride_id = $1 AND sender_id = $2)
       )`,
      [message.rideId, req.user.id]
    );
  }

  if (accessCheck.rows.length === 0) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    message: message.toJSON(),
  });
});

// Get message statistics (admin only)
const getMessageStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query(`
    SELECT
      COUNT(*)::int as total_messages,
      COUNT(DISTINCT sender_id)::int as unique_senders,
      COUNT(DISTINCT CONCAT(ride_type, ':', ride_id))::int as unique_conversations,
      COUNT(CASE WHEN ride_type = 'offer' THEN 1 END)::int as offer_messages,
      COUNT(CASE WHEN ride_type = 'demand' THEN 1 END)::int as demand_messages,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END)::int as messages_last_24h,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)::int as messages_last_7d
    FROM messages
  `);

  res.json({
    stats: result.rows[0],
  });
});

// Get user message statistics
const getUserMessageStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query(
    `
    SELECT
      COUNT(*)::int as total_messages,
      COUNT(CASE WHEN sender_id = $1 THEN 1 END)::int as sent_messages,
      COUNT(DISTINCT CONCAT(ride_type, ':', ride_id))::int as conversations,
      COUNT(CASE WHEN sender_id = $1 AND created_at > NOW() - INTERVAL '24 hours' THEN 1 END)::int as sent_today
    FROM messages
    WHERE sender_id = $1
       OR (ride_type = 'offer' AND ride_id IN (SELECT id FROM offers WHERE driver_id = $1))
       OR (ride_type = 'offer' AND ride_id IN (SELECT offer_id FROM bookings WHERE passenger_id = $1))
       OR (ride_type = 'demand' AND ride_id IN (SELECT id FROM demands WHERE passenger_id = $1))
       OR (ride_type = 'demand' AND ride_id IN (SELECT demand_id FROM demand_responses WHERE driver_id = $1))
  `,
    [req.user.id]
  );

  res.json({
    stats: result.rows[0],
  });
});

// Edit a message (sender only, within 15 mins)
const editMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Message content is required', 400);
  }

  if (content.trim().length > 1000) {
    throw new AppError('Message is too long (max 1000 characters)', 400);
  }

  try {
    const message = await Message.edit(id, req.user.id, content.trim());

    // Send real-time notification to the other participant
    const io = req.app.get('io');
    if (io) {
      const { notifyMessageEdited } = require('../socket');
      if (notifyMessageEdited) {
        // PRIVACY FIX: Send notification only to the other participant
        const recipientId = message.receiverId || message.senderId;
        if (recipientId && recipientId !== req.user.id) {
          notifyMessageEdited(io, recipientId, message.toJSON());
        }
      }
    }

    res.json({
      message: 'تم تعديل الرسالة بنجاح',
      messageData: message.toJSON(),
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      throw new AppError('Message not found', 404);
    }
    if (error.message.includes('sender')) {
      throw new AppError('يمكنك فقط تعديل رسائلك', 403);
    }
    if (error.message.includes('15 minutes')) {
      throw new AppError('لا يمكن تعديل الرسالة بعد مرور 15 دقيقة', 400);
    }
    throw error;
  }
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deleteForAll } = req.query;

  try {
    let message;

    if (deleteForAll === 'true') {
      // Delete for everyone (sender only)
      message = await Message.deleteForEveryone(id, req.user.id);
    } else {
      // Delete for me only
      message = await Message.deleteForMe(id, req.user.id);
    }

    // Send real-time notification for delete-for-all
    if (deleteForAll === 'true') {
      const io = req.app.get('io');
      if (io) {
        const { notifyMessageDeleted } = require('../socket');
        if (notifyMessageDeleted) {
          // PRIVACY FIX: Send notification only to the other participant
          const recipientId = message.receiverId || message.senderId;
          if (recipientId && recipientId !== req.user.id) {
            notifyMessageDeleted(io, recipientId, {
              messageId: message.id,
              rideType: message.rideType,
              rideId: message.rideId
            });
          }
        }
      }
    }

    res.json({
      message: deleteForAll === 'true' ? 'تم حذف الرسالة للجميع' : 'تم حذف الرسالة',
      messageId: id,
      deleteForAll: deleteForAll === 'true',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      throw new AppError('Message not found', 404);
    }
    if (error.message.includes('sender')) {
      throw new AppError('يمكنك فقط حذف رسائلك للجميع', 403);
    }
    throw error;
  }
});

// Delete entire conversation for current user
const deleteConversation = asyncHandler(async (req, res) => {
  const { rideType, rideId } = req.params;

  // Validate ride type
  if (!['offer', 'demand'].includes(rideType)) {
    throw new AppError('Invalid ride type', 400);
  }

  const { query } = require('../config/db');

  // Delete all messages in this conversation for the current user
  const result = await query(
    `UPDATE messages
     SET deleted_for_user_ids = array_append(deleted_for_user_ids, $3::uuid),
         updated_at = CURRENT_TIMESTAMP
     WHERE ride_type = $1 AND ride_id = $2
       AND NOT ($3::uuid = ANY(deleted_for_user_ids))
     RETURNING id`,
    [rideType, rideId, req.user.id]
  );

  res.json({
    message: 'تم حذف المحادثة بنجاح',
    deletedCount: result.rows.length,
    rideType,
    rideId,
  });
});

// Deprecated endpoints for backward compatibility
const getInbox = asyncHandler(async (req, res) => {
  throw new AppError('This endpoint is deprecated. Use GET /messages/conversations instead', 410);
});

const getSentMessages = asyncHandler(async (req, res) => {
  throw new AppError('This endpoint is deprecated. Use GET /messages/conversations instead', 410);
});

module.exports = {
  sendMessage,
  getRideMessages,
  getConversation, // deprecated
  getInbox, // deprecated
  getSentMessages, // deprecated
  getConversationList,
  getRecentMessages,
  markAsRead,
  markConversationAsRead,
  getUnreadCount,
  getMessageById,
  getMessageStats,
  getUserMessageStats,
  // New endpoints
  editMessage,
  deleteMessage,
  deleteConversation,
};
