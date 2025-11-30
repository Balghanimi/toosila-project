const express = require('express');
const router = express.Router();

// Import controllers
const {
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
  getUserMessageStats
} = require('../controllers/messages.controller');

// Import middlewares
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { moderateLimiter } = require('../middlewares/rateLimiters');
const {
  validateMessageCreation,
  validateId,
  validatePagination
} = require('../middlewares/validate');

// All routes require authentication
router.use(authenticateToken);

// Admin routes - MUST be defined BEFORE dynamic routes like /:rideType/:rideId
router.get('/admin/stats', requireAdmin, getMessageStats);

// Message management routes
router.post('/', moderateLimiter, validateMessageCreation, sendMessage);
router.get('/conversations', validatePagination, getConversationList);
router.get('/recent', getRecentMessages);
router.get('/unread-count', getUnreadCount);
router.get('/stats', getUserMessageStats);

// Deprecated routes (return 410 Gone)
router.get('/inbox', getInbox);
router.get('/sent', getSentMessages);
router.get('/conversation/:userId', getConversation);

// Dynamic routes - MUST be defined AFTER static routes
router.get('/:rideType/:rideId', validatePagination, getRideMessages);
router.get('/:id', validateId, getMessageById);
router.put('/:id/read', validateId, markAsRead);
router.put('/conversation/:rideType/:rideId/read', markConversationAsRead);

module.exports = router;
