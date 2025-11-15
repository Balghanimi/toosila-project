/**
 * NotificationCard Component
 * مكون إشعار قابل للتوسيع مع أزرار التفاعل
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * الحصول على أيقونة الإشعار حسب النوع
 */
const getNotificationIcon = (type) => {
  const icons = {
    demand_response: '📮',
    response_accepted: '✅',
    response_rejected: '❌',
    booking_created: '🎫',
    booking_accepted: '✅',
    booking_rejected: '❌',
    new_message: '💬',
    trip_reminder: '⏰',
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

  return new Date(timestamp).toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * @param {Object} props
 * @param {Object} props.notification - بيانات الإشعار
 * @param {Function} props.onDelete - دالة الحذف
 * @param {Function} props.onMarkAsRead - دالة تحديد كمقروء
 */
function NotificationCard({ notification, onDelete, onMarkAsRead }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const data = notification.data || {};

  // معالجة قبول الحجز
  const handleAccept = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const bookingId = data.bookingId || data.booking_id;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('تم قبول الطلب بنجاح ✅');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء قبول الطلب');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('حدث خطأ أثناء قبول الطلب');
    }

    setIsProcessing(false);
  };

  // معالجة رفض الحجز
  const handleReject = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const bookingId = data.bookingId || data.booking_id;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('تم رفض الطلب ✅');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء رفض الطلب');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('حدث خطأ أثناء رفض الطلب');
    }

    setIsProcessing(false);
  };

  // معالجة المراسلة
  const handleMessage = (e) => {
    e.stopPropagation();
    if (data.senderId || data.sender_id) {
      navigate(`/messages?userId=${data.senderId || data.sender_id}`);
    } else {
      navigate('/messages');
    }
  };

  // معالجة النقر على الكارد
  const handleCardClick = async () => {
    if (!notification.isRead && onMarkAsRead) {
      await onMarkAsRead(notification.id);
    }
    setIsExpanded(!isExpanded);
  };

  // معالجة الحذف
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  // تحديد ما إذا كانت الأزرار يجب أن تظهر
  const showActions = notification.type === 'booking_created' && isExpanded;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header - قابل للضغط */}
      <div
        onClick={handleCardClick}
        style={{
          padding: '16px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          backgroundColor: notification.isRead ? 'white' : '#eff6ff',
          borderRight: notification.isRead ? 'none' : '4px solid #3b82f6',
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
            alignItems: 'start',
            justifyContent: 'space-between',
            direction: 'rtl',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
            {/* الأيقونة */}
            <div
              style={{
                fontSize: '1.5rem',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {getNotificationIcon(notification.type)}
            </div>

            {/* المحتوى */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  fontSize: '0.9375rem',
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
                }}
              >
                {notification.message}
              </p>

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

          {/* أيقونة التوسيع + زر الحذف */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* زر حذف */}
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

            {/* أيقونة التوسيع */}
            <div
              style={{
                fontSize: '1.25rem',
                color: '#9ca3af',
                transition: 'transform 0.3s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
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
                }}
              ></div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - تظهر عند التوسيع */}
      {showActions && (
        <div
          className="notification-actions"
          style={{
            borderTop: '1px solid #e5e7eb',
            padding: '16px',
            background: '#f9fafb',
          }}
        >
          {/* معلومات إضافية */}
          {data.route || data.date || data.price || data.seats ? (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  fontSize: '0.875rem',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {data.route && (
                  <div>
                    <span style={{ color: '#6b7280' }}>المسار: </span>
                    <span style={{ fontWeight: '600' }}>{data.route}</span>
                  </div>
                )}
                {data.date && (
                  <div>
                    <span style={{ color: '#6b7280' }}>التاريخ: </span>
                    <span style={{ fontWeight: '600' }}>{data.date}</span>
                  </div>
                )}
                {data.price && (
                  <div>
                    <span style={{ color: '#6b7280' }}>السعر: </span>
                    <span style={{ fontWeight: '600', color: '#22c55e' }}>{data.price} د.ع</span>
                  </div>
                )}
                {data.seats && (
                  <div>
                    <span style={{ color: '#6b7280' }}>المقاعد: </span>
                    <span style={{ fontWeight: '600' }}>{data.seats}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* الأزرار */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* زر القبول */}
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.9375rem',
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✓ قبول
            </button>

            {/* زر الرفض */}
            <button
              onClick={handleReject}
              disabled={isProcessing}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.9375rem',
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✕ رفض
            </button>

            {/* زر المراسلة */}
            <button
              onClick={handleMessage}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.9375rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              💬 مراسلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCard;
