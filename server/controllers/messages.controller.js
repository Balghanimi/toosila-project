const Message = require('../models/messages.model');
const { asyncHandler, AppError } = require('../middlewares/error');
const { notifyNewMessage } = require('../socket');

// Send a new message
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  
  // Check if recipient exists
  const User = require('../models/users.model');
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError('Recipient not found', 404);
  }

  // Check if user is not sending message to themselves
  if (recipientId === req.user.id) {
    throw new AppError('You cannot send a message to yourself', 400);
  }

  const message = await Message.create({
    senderId: req.user.id,
    recipientId,
    content
  });

  // Send real-time notification to recipient
  const io = req.app.get('io');
  if (io) {
    notifyNewMessage(io, recipientId, {
      ...message.toJSON(),
      senderName: req.user.name || `${req.user.firstName} ${req.user.lastName}`
    });
  }

  res.status(201).json({
    message: 'Message sent successfully',
    messageData: message.toJSON()
  });
});

// Get conversation between two users
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  // Check if the other user exists
  const User = require('../models/users.model');
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    throw new AppError('User not found', 404);
  }

  const result = await Message.getConversation(
    req.user.id, 
    parseInt(userId), 
    parseInt(page), 
    parseInt(limit)
  );
  
  res.json({
    ...result,
    otherUser: {
      id: otherUser.id,
      firstName: otherUser.firstName,
      lastName: otherUser.lastName
    }
  });
});

// Get user's inbox (received messages)
const getInbox = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await Message.findByUserId(req.user.id, parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Get user's sent messages
const getSentMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await Message.findSentByUserId(req.user.id, parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Get conversation list
const getConversationList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await Message.getConversationList(req.user.id, parseInt(page), parseInt(limit));
  
  res.json(result);
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const message = await Message.findById(id);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Check if user is the recipient
  if (message.recipientId !== req.user.id) {
    throw new AppError('You can only mark your own messages as read', 403);
  }

  const updatedMessage = await message.markAsRead();

  res.json({
    message: 'Message marked as read',
    messageData: updatedMessage.toJSON()
  });
});

// Mark conversation as read
const markConversationAsRead = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if the other user exists
  const User = require('../models/users.model');
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    throw new AppError('User not found', 404);
  }

  const updatedMessages = await Message.markConversationAsRead(req.user.id, parseInt(userId));

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

  // Check if user is sender or recipient
  if (message.senderId !== req.user.id && message.recipientId !== req.user.id) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    message: message.toJSON()
  });
});

// Get message statistics
const getMessageStats = asyncHandler(async (req, res) => {
  const { query } = require('../config/db');
  
  const result = await query(`
    SELECT 
      COUNT(*) as total_messages,
      COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages,
      COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages,
      COUNT(DISTINCT sender_id) as unique_senders,
      COUNT(DISTINCT recipient_id) as unique_recipients
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
      COUNT(*) as total_messages,
      COUNT(CASE WHEN sender_id = $1 THEN 1 END) as sent_messages,
      COUNT(CASE WHEN recipient_id = $1 THEN 1 END) as received_messages,
      COUNT(CASE WHEN recipient_id = $1 AND is_read = false THEN 1 END) as unread_messages
    FROM messages
    WHERE sender_id = $1 OR recipient_id = $1
  `, [req.user.id]);

  res.json({
    stats: result.rows[0]
  });
});

module.exports = {
  sendMessage,
  getConversation,
  getInbox,
  getSentMessages,
  getConversationList,
  markAsRead,
  markConversationAsRead,
  getUnreadCount,
  getMessageById,
  getMessageStats,
  getUserMessageStats
};

