/**
 * NotificationItem Component
 * مكون لعرض إشعار واحد
 */

import React from 'react';

/**
 * الحصول على أيقونة الإشعار حسب النوع
 */
const getNotificationIcon = (type) => {
  const icons = {
    demand_response: '📮', // رد على طلب
    response_accepted: '✅', // قبول رد
    response_rejected: '❌', // رفض رد
    booking_created: '🎫', // حجز جديد
    booking_accepted: '✅', // قبول حجز
    booking_rejected: '❌', // رفض حجز
    new_message: '💬', // رسالة جديدة
    trip_reminder: '⏰', // تذكير برحلة
  };
  return icons[type] || '🔔';
};

/**
 * حساب الوقت منذ إنشاء الإشعار
 */
const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);

  if (seconds < 60) return 'الآن';

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتان' : 'دقائق'}`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : 'ساعات'}`;
  }

  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `منذ ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومان' : 'أيام'}`;
  }

  // أكثر من أسبوع: عرض التاريخ
  return new Date(timestamp).toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * @param {Object} props
 * @param {Object} props.notification - بيانات الإشعار
 * @param {Function} props.onClick - دالة عند النقر على الإشعار
 * @param {boolean} props.compact - نسخة مصغرة للـ dropdown
 * @param {boolean} props.showDelete - عرض زر الحذف
 * @param {Function} props.onDelete - دالة الحذف
 */
function NotificationItem({
  notification,
  onClick,
  compact = false,
  showDelete = false,
  onDelete,
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: notification.isRead ? 'white' : '#eff6ff',
        borderRight: notification.isRead ? 'none' : '4px solid #3b82f6',
        padding: compact ? '12px' : '16px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = notification.isRead ? '#f9fafb' : '#dbeafe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : '#eff6ff';
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'start',
          direction: 'rtl',
        }}
      >
        {/* الأيقونة */}
        <div
          style={{
            fontSize: compact ? '1.25rem' : '1.5rem',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* المحتوى */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <h4
            style={{
              fontSize: compact ? '0.875rem' : '0.9375rem',
              fontWeight: notification.isRead ? '600' : '700',
              color: notification.isRead ? '#1f2937' : '#1e3a8a',
              marginBottom: '4px',
              fontFamily: '"Cairo", sans-serif',
              textAlign: 'right',
              lineHeight: '1.4',
            }}
          >
            {notification.title}
          </h4>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '8px',
              fontFamily: '"Cairo", sans-serif',
              textAlign: 'right',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {notification.message}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {getTimeAgo(notification.createdAt)}
            </span>
          </div>
        </div>

        {/* نقطة غير مقروء */}
        {!notification.isRead && (
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              flexShrink: 0,
              marginTop: '8px',
            }}
          ></div>
        )}

        {/* زر حذف */}
        {showDelete && (
          <button
            onClick={handleDelete}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.125rem',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '4px',
              flexShrink: 0,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
            }}
            aria-label="حذف الإشعار"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;
