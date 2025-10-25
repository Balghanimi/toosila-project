/**
 * Notifications Context
 * Context لإدارة الإشعارات على مستوى التطبيق
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب الإشعارات
  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await notificationsAPI.getNotifications(20, 0);
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // جلب عدد الإشعارات غير المقروءة
  const loadUnreadCount = useCallback(async () => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, [currentUser]);

  // تحديد إشعار كمقروء
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      // تحديث الحالة المحلية
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // تقليل العداد
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();

      // تحديث الحالة المحلية
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);

      // إزالة من القائمة المحلية
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      // إذا كان غير مقروء، تقليل العداد
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  // تحديث (refresh) الإشعارات
  const refresh = () => {
    loadNotifications();
    loadUnreadCount();
  };

  // جلب الإشعارات عند التحميل والتسجيل
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [currentUser, loadNotifications, loadUnreadCount]);

  // Polling: جلب العدد غير المقروء كل 30 ثانية
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // 30 ثانية

    return () => clearInterval(interval);
  }, [currentUser, loadUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook لاستخدام context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export default NotificationsContext;
