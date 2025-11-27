const Message = require('../models/messages.model');
const { asyncHandler, AppError } = require('../middlewares/error');
const { notifyNewMessage } = require('../socket');

// Send a new message (ride-based)
const sendMessage = asyncHandler(async (req, res) => {
  const { rideType, rideId, content } = req.body;

  // Validate ride type
  if (!['offer', 'demand'].includes(rideType)) {
    throw new AppError('Invalid ride type. Must be "offer" or "demand"', 400);
  }

  // Verify the ride exists
  const { query } = require('../config/db');
  let rideCheck;

  if (rideType === 'offer') {
    // For offers: check if offer exists and is active
    rideCheck = await query(
      `SELECT o.id, o.driver_id, o.from_city, o.to_city
       FROM offers o
       WHERE o.id = $1 AND o.is_active = true`,
      [rideId]
    );

    // If user is the driver of this offer, only allow if they're REPLYING to existing messages
    // (i.e., there are already messages from other users in this conversation)
    if (rideCheck.rows.length > 0 && rideCheck.rows[0].driver_id === req.user.id) {
      // Check if there are any messages from OTHER users in this conversation
      const existingMessages = await query(
        `SELECT 1 FROM messages
         WHERE ride_type = 'offer' AND ride_id = $1 AND sender_id != $2
         LIMIT 1`,
        [rideId, req.user.id]
      );

      if (existingMessages.rows.length === 0) {
        // Driver is trying to start a conversation with themselves - block this
        throw new AppError('You cannot start a conversation on your own offer', 400);
      }
      // Otherwise, driver is replying to a passenger - allow it
    }
  } else {
    // For demands: check if user is passenger or responded to this demand
    rideCheck = await query(
      `SELECT d.id, d.passenger_id, d.from_city, d.to_city
       FROM demands d
       WHERE d.id = $1 AND (
         d.passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2 AND status IN ('pending', 'accepted'))
       )`,
      [rideId, req.user.id]
    );
  }

  if (rideCheck.rows.length === 0) {
    throw new AppError('Ride not found or you do not have access to this conversation', 404);
  }

  // Create message
  const message = await Message.create({
    rideType,
    rideId,
    senderId: req.user.id,
    content
  });

  // Get other participants in the conversation to notify them
  const io = req.app.get('io');
  if (io) {
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
      // Notify passenger and all drivers with accepted responses
      participantsQuery = await query(
        `SELECT DISTINCT u.id, u.name
         FROM users u
         WHERE u.id != $1 AND (
           u.id = (SELECT passenger_id FROM demands WHERE id = $2) OR
           u.id IN (SELECT driver_id FROM demand_responses WHERE demand_id = $2 AND status IN ('pending', 'accepted'))
         )`,
        [req.user.id, rideId]
      );
    }

    // Send notification to each participant
    participantsQuery.rows.forEach(participant => {
      notifyNewMessage(io, participant.id, {
        ...message.toJSON(),
        senderName: req.user.name || `${req.user.firstName} ${req.user.lastName}`,
        ride: rideCheck.rows[0]
      });
    });
  }

  res.status(201).json({
    message: 'Message sent successfully',
    messageData: message.toJSON()
  });
});

// Get messages for a specific ride
const getRideMessages = asyncHandler(async (req, res) => {
  const { rideType, rideId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Validate ride type
  if (!['offer', 'demand'].includes(rideType)) {
    throw new AppError('Invalid ride type. Must be "offer" or "demand"', 400);
  }

  // Verify user has access to this ride
  const { query } = require('../config/db');
  let accessCheck;

  if (rideType === 'offer') {
    // For offers: any authenticated user can view the conversation
    // (they can message any offer except their own - checked in sendMessage)
    // Just verify the offer exists and is active
    accessCheck = await query(
      `SELECT 1 FROM offers WHERE id = $1 AND is_active = true`,
      [rideId]
    );

    if (accessCheck.rows.length === 0) {
      throw new AppError('Offer not found or inactive', 404);
    }
  } else {
    // For demands: check if user is passenger or responded to this demand
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2)
       )`,
      [rideId, req.user.id]
    );

    if (accessCheck.rows.length === 0) {
      throw new AppError('Access denied to this conversation', 403);
    }
  }

  const result = await Message.getByRide(rideType, rideId, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get conversation between two users (deprecated - use ride-based instead)
const getConversation = asyncHandler(async (req, res) => {
  throw new AppError('This endpoint is deprecated. Use GET /messages/:rideType/:rideId instead', 410);
});

// Get user's conversation list
const getConversationList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await Message.getConversationList(req.user.id, parseInt(page), parseInt(limit));

  res.json(result);
});

// Get recent messages for user
const getRecentMessages = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const messages = await Message.getRecentForUser(req.user.id, parseInt(limit));

  res.json({
    messages,
    total: messages.length
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
         EXISTS (SELECT 1 FROM bookings WHERE offer_id = $1 AND passenger_id = $2)
       )`,
      [message.rideId, req.user.id]
    );
  } else {
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2)
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
    messageData: updatedMessage.toJSON()
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
         EXISTS (SELECT 1 FROM bookings WHERE offer_id = $1 AND passenger_id = $2)
       )`,
      [rideId, req.user.id]
    );
  } else {
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2)
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
    updatedCount: updatedMessages.length
  });
});

// Get unread message count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.getUnreadCount(req.user.id);

  res.json({
    unreadCount: count
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
    accessCheck = await query(
      `SELECT 1 FROM demands WHERE id = $1 AND (
         passenger_id = $2 OR
         EXISTS (SELECT 1 FROM demand_responses WHERE demand_id = $1 AND driver_id = $2)
       )`,
      [message.rideId, req.user.id]
    );
  }

  if (accessCheck.rows.length === 0) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    message: message.toJSON()
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
    stats: result.rows[0]
  });
});

// Get user message statistics
const getUserMessageStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');

  const result = await query(`
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
  `, [req.user.id]);

  res.json({
    stats: result.rows[0]
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
  markAsRead, // requires migration
  markConversationAsRead, // requires migration
  getUnreadCount, // requires migration
  getMessageById,
  getMessageStats,
  getUserMessageStats
};
