/**
 * Notifications Model
 * نموذج البيانات للإشعارات
 *
 * يوفر جميع العمليات المتعلقة بالإشعارات:
 * - إنشاء إشعار جديد
 * - جلب إشعارات المستخدم
 * - عدد الإشعارات غير المقروءة
 * - تحديد كمقروء
 * - حذف الإشعارات
 */

const { query } = require('../config/db');

class NotificationModel {
  constructor(notification) {
    this.id = notification.id;
    this.userId = notification.user_id;
    this.type = notification.type;
    this.title = notification.title;
    this.message = notification.message;
    this.data = notification.data;
    this.isRead = notification.is_read;
    this.createdAt = notification.created_at;
  }

  /**
   * إنشاء إشعار جديد
   * @param {string} userId - معرف المستخدم
   * @param {string} type - نوع الإشعار
   * @param {string} title - عنوان الإشعار
   * @param {string} message - محتوى الإشعار
   * @param {object} data - بيانات إضافية (اختياري)
   * @returns {Promise<NotificationModel>}
   */
  static async create(userId, type, title, message, data = null) {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data, is_read)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING *`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );

    return new NotificationModel(result.rows[0]);
  }

  /**
   * جلب إشعارات المستخدم مع pagination
   * @param {string} userId - معرف المستخدم
   * @param {number} limit - عدد الإشعارات
   * @param {number} offset - الإزاحة
   * @returns {Promise<Array<NotificationModel>>}
   */
  static async getUserNotifications(userId, limit = 20, offset = 0) {
    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map(row => new NotificationModel(row));
  }

  /**
   * جلب عدد الإشعارات غير المقروءة للمستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<number>}
   */
  static async getUnreadCount(userId) {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * جلب إشعار محدد بمعرفه
   * @param {string} notificationId - معرف الإشعار
   * @returns {Promise<NotificationModel|null>}
   */
  static async findById(notificationId) {
    const result = await query(
      `SELECT * FROM notifications WHERE id = $1`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new NotificationModel(result.rows[0]);
  }

  /**
   * تحديد إشعار كمقروء
   * @param {string} notificationId - معرف الإشعار
   * @param {string} userId - معرف المستخدم (للتحقق من الصلاحية)
   * @returns {Promise<NotificationModel|null>}
   */
  static async markAsRead(notificationId, userId) {
    const result = await query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new NotificationModel(result.rows[0]);
  }

  /**
   * تحديد جميع إشعارات المستخدم كمقروءة
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<number>} - عدد الإشعارات المحدثة
   */
  static async markAllAsRead(userId) {
    const result = await query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE
       RETURNING id`,
      [userId]
    );

    return result.rowCount;
  }

  /**
   * حذف إشعار
   * @param {string} notificationId - معرف الإشعار
   * @param {string} userId - معرف المستخدم (للتحقق من الصلاحية)
   * @returns {Promise<boolean>}
   */
  static async delete(notificationId, userId) {
    const result = await query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );

    return result.rowCount > 0;
  }

  /**
   * حذف الإشعارات القديمة (أكثر من X يوم)
   * @param {number} days - عدد الأيام (افتراضي 30)
   * @returns {Promise<number>} - عدد الإشعارات المحذوفة
   */
  static async deleteOld(days = 30) {
    const result = await query(
      `DELETE FROM notifications
       WHERE created_at < NOW() - INTERVAL '${days} days'
       AND is_read = TRUE`,
      []
    );

    return result.rowCount;
  }

  /**
   * جلب الإشعارات حسب النوع
   * @param {string} userId - معرف المستخدم
   * @param {string} type - نوع الإشعار
   * @param {number} limit - عدد الإشعارات
   * @returns {Promise<Array<NotificationModel>>}
   */
  static async getByType(userId, type, limit = 20) {
    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND type = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, type, limit]
    );

    return result.rows.map(row => new NotificationModel(row));
  }

  /**
   * جلب الإشعارات غير المقروءة فقط
   * @param {string} userId - معرف المستخدم
   * @param {number} limit - عدد الإشعارات
   * @returns {Promise<Array<NotificationModel>>}
   */
  static async getUnread(userId, limit = 20) {
    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND is_read = FALSE
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => new NotificationModel(row));
  }

  /**
   * التحقق من وجود إشعار مشابه حديث
   * (لتجنب إنشاء إشعارات مكررة)
   * @param {string} userId - معرف المستخدم
   * @param {string} type - نوع الإشعار
   * @param {object} data - البيانات المرفقة
   * @param {number} minutesAgo - عدد الدقائق للبحث (افتراضي 5)
   * @returns {Promise<boolean>}
   */
  static async hasSimilarRecent(userId, type, data, minutesAgo = 5) {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1
       AND type = $2
       AND data = $3
       AND created_at > NOW() - INTERVAL '${minutesAgo} minutes'`,
      [userId, type, data ? JSON.stringify(data) : null]
    );

    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * تحويل إلى JSON
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      isRead: this.isRead,
      createdAt: this.createdAt
    };
  }
}

module.exports = NotificationModel;
