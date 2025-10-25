/**
 * Notifications Routes
 * مسارات الإشعارات
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnread,
  getByType
} = require('../controllers/notifications.controller');

// جميع المسارات تتطلب المصادقة
router.use(protect);

// GET /api/notifications - جلب إشعارات المستخدم مع pagination
router.get('/', getNotifications);

// GET /api/notifications/unread-count - عدد الإشعارات غير المقروءة
router.get('/unread-count', getUnreadCount);

// GET /api/notifications/unread - جلب الإشعارات غير المقروءة فقط
router.get('/unread', getUnread);

// GET /api/notifications/type/:type - جلب الإشعارات حسب النوع
router.get('/type/:type', getByType);

// PATCH /api/notifications/mark-all-read - تحديد جميع الإشعارات كمقروءة
router.patch('/mark-all-read', markAllAsRead);

// PATCH /api/notifications/:id/read - تحديد إشعار كمقروء
router.patch('/:id/read', markAsRead);

// DELETE /api/notifications/:id - حذف إشعار
router.delete('/:id', deleteNotification);

module.exports = router;
