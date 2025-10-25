/**
 * Notifications Controller
 * معالجات طلبات الإشعارات
 */

const NotificationModel = require('../models/notifications.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * جلب إشعارات المستخدم الحالي
 * GET /api/notifications
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  // التحقق من صحة القيم
  if (limit < 1 || limit > 100) {
    throw new AppError('الحد الأقصى يجب أن يكون بين 1 و 100', 400);
  }

  if (offset < 0) {
    throw new AppError('الإزاحة يجب أن تكون قيمة موجبة', 400);
  }

  const notifications = await NotificationModel.getUserNotifications(userId, limit, offset);

  res.status(200).json({
    success: true,
    data: {
      notifications: notifications.map(n => n.toJSON()),
      limit,
      offset,
      count: notifications.length
    }
  });
});

/**
 * جلب عدد الإشعارات غير المقروءة
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await NotificationModel.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    data: {
      unreadCount: count
    }
  });
});

/**
 * تحديد إشعار كمقروء
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  const notification = await NotificationModel.markAsRead(notificationId, userId);

  if (!notification) {
    throw new AppError('الإشعار غير موجود أو ليس لديك صلاحية لتعديله', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم تحديد الإشعار كمقروء',
    data: {
      notification: notification.toJSON()
    }
  });
});

/**
 * تحديد جميع الإشعارات كمقروءة
 * PATCH /api/notifications/mark-all-read
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await NotificationModel.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: `تم تحديد ${count} إشعار كمقروء`,
    data: {
      updatedCount: count
    }
  });
});

/**
 * حذف إشعار
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  const deleted = await NotificationModel.delete(notificationId, userId);

  if (!deleted) {
    throw new AppError('الإشعار غير موجود أو ليس لديك صلاحية لحذفه', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم حذف الإشعار بنجاح'
  });
});

/**
 * جلب الإشعارات غير المقروءة فقط
 * GET /api/notifications/unread
 */
exports.getUnread = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 20;

  const notifications = await NotificationModel.getUnread(userId, limit);

  res.status(200).json({
    success: true,
    data: {
      notifications: notifications.map(n => n.toJSON()),
      count: notifications.length
    }
  });
});

/**
 * جلب الإشعارات حسب النوع
 * GET /api/notifications/type/:type
 */
exports.getByType = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const type = req.params.type;
  const limit = parseInt(req.query.limit) || 20;

  // أنواع الإشعارات المسموح بها
  const allowedTypes = [
    'demand_response',
    'response_accepted',
    'response_rejected',
    'booking_created',
    'booking_accepted',
    'booking_rejected',
    'new_message',
    'trip_reminder'
  ];

  if (!allowedTypes.includes(type)) {
    throw new AppError('نوع الإشعار غير صحيح', 400);
  }

  const notifications = await NotificationModel.getByType(userId, type, limit);

  res.status(200).json({
    success: true,
    data: {
      notifications: notifications.map(n => n.toJSON()),
      type,
      count: notifications.length
    }
  });
});
