/**
 * Socket.io Real-time Notifications System
 *
 * Handles real-time events for:
 * - New bookings on driver's offers
 * - Booking acceptance/rejection
 * - New messages in conversations
 * - Driver responses to passenger demands
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Store active user connections: { userId: socketId }
const activeUsers = new Map();

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {SocketIO.Server} - Socket.io server instance
 */
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? config.CLIENT_URL
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Store user connection
    activeUsers.set(userId, socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to real-time notifications',
      userId: userId
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      activeUsers.delete(userId);
    });

    // Handle manual reconnection
    socket.on('reconnect', () => {
      activeUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
    });

    // Heartbeat to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
}

/**
 * Emit event to specific user
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {string} userId - Target user ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
function emitToUser(io, userId, event, data) {
  if (!io) {
    console.error('Socket.io instance not initialized');
    return;
  }

  const room = `user:${userId}`;
  io.to(room).emit(event, data);
}

/**
 * Emit new booking notification to driver
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {string} driverId - Driver's user ID
 * @param {object} booking - Booking data
 */
function notifyNewBooking(io, driverId, booking) {
  emitToUser(io, driverId, 'new-booking', {
    type: 'new-booking',
    title: 'حجز جديد!',
    message: `لديك حجز جديد على رحلتك ${booking.fromCity} ← ${booking.toCity}`,
    booking: booking,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emit booking status update to passenger
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {string} passengerId - Passenger's user ID
 * @param {object} booking - Booking data with status
 */
function notifyBookingStatusUpdate(io, passengerId, booking) {
  const statusText = booking.status === 'accepted' ? 'تم قبول' : 'تم رفض';
  const emoji = booking.status === 'accepted' ? '✅' : '❌';

  emitToUser(io, passengerId, 'booking-status-updated', {
    type: 'booking-status-updated',
    title: `${emoji} ${statusText} حجزك`,
    message: `${statusText} حجزك على رحلة ${booking.fromCity} ← ${booking.toCity}`,
    booking: booking,
    status: booking.status,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emit new message notification
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {string} recipientId - Recipient's user ID
 * @param {object} message - Message data
 */
function notifyNewMessage(io, recipientId, message) {
  emitToUser(io, recipientId, 'new-message', {
    type: 'new-message',
    title: '💬 رسالة جديدة',
    message: `لديك رسالة جديدة من ${message.senderName}`,
    messageData: message,
    conversationId: message.conversationId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emit new demand response notification to passenger
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {string} passengerId - Passenger's user ID
 * @param {object} response - Demand response data
 */
function notifyNewDemandResponse(io, passengerId, response) {
  emitToUser(io, passengerId, 'new-demand-response', {
    type: 'new-demand-response',
    title: '💬 رد جديد على طلبك',
    message: `رد سائق على طلبك ${response.fromCity} ← ${response.toCity}. اضغط لعرض الرد`,
    response: response,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emit demand response status update to driver
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {string} driverId - Driver's user ID
 * @param {object} response - Demand response data with status
 */
function notifyDemandResponseStatusUpdate(io, driverId, response) {
  const statusText = response.status === 'accepted' ? 'تم قبول' : 'تم رفض';
  const emoji = response.status === 'accepted' ? '✅' : '❌';

  emitToUser(io, driverId, 'demand-response-status-updated', {
    type: 'demand-response-status-updated',
    title: `${emoji} ${statusText} عرضك`,
    message: `${statusText} عرضك على طلب ${response.fromCity} ← ${response.toCity}`,
    response: response,
    status: response.status,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get count of active users
 * @returns {number} - Number of active connections
 */
function getActiveUsersCount() {
  return activeUsers.size;
}

/**
 * Check if user is online
 * @param {string} userId - User ID to check
 * @returns {boolean} - True if user is connected
 */
function isUserOnline(userId) {
  return activeUsers.has(userId);
}

module.exports = {
  initializeSocket,
  emitToUser,
  notifyNewBooking,
  notifyBookingStatusUpdate,
  notifyNewMessage,
  notifyNewDemandResponse,
  notifyDemandResponseStatusUpdate,
  getActiveUsersCount,
  isUserOnline
};
