const express = require('express');
const router = express.Router();

// Import controllers
const {
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

// Message management routes
router.post('/', moderateLimiter, validateMessageCreation, sendMessage);
router.get('/stats', getMessageStats);
router.get('/my/stats', getUserMessageStats);
router.get('/unread-count', getUnreadCount);
router.get('/conversations', validatePagination, getConversationList);
router.get('/inbox', validatePagination, getInbox);
router.get('/sent', validatePagination, getSentMessages);
router.get('/conversation/:userId', validateId, validatePagination, getConversation);
router.get('/:id', validateId, getMessageById);
router.put('/:id/read', markAsRead);
router.put('/conversation/:userId/read', validateId, markConversationAsRead);

// Admin routes
router.get('/admin/stats', requireAdmin, getMessageStats);

module.exports = router;

