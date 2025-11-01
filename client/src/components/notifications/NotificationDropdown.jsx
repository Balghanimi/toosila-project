/**
 * NotificationDropdown Component
 * قائمة منسدلة للإشعارات
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationsContext';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';

/**
 * @param {Object} props
 * @param {Function} props.onClose - دالة لإغلاق الـ dropdown
 * @param {React.Ref} props.dropdownRef - ref للـ dropdown
 */
function NotificationDropdown({ onClose, dropdownRef }) {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  // معالجة "تحديد الكل كمقروء"
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // معالجة النقر على إشعار
  const handleNotificationClick = async (notification) => {
    try {
      // تحديد كمقروء
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // الانتقال حسب نوع الإشعار
      const routes = {
        demand_response: () => {
          // السائق رد على طلبك - انتقل إلى الطلبات وافتح modal العروض
          if (notification.relatedId) {
            navigate('/demands', {
              state: {
                openDemandId: notification.relatedId,
                action: 'viewResponses'
              }
            });
          } else {
            navigate('/demands');
          }
        },
        response_accepted: () => {
          // تم قبول ردك - انتقل إلى الطلبات
          if (notification.relatedId) {
            navigate('/demands', {
              state: {
                openDemandId: notification.relatedId,
                action: 'viewResponses'
              }
            });
          } else {
            navigate('/demands');
          }
        },
        response_rejected: () => {
          // تم رفض ردك - انتقل إلى الطلبات
          if (notification.relatedId) {
            navigate('/demands', {
              state: {
                openDemandId: notification.relatedId,
                action: 'viewResponses'
              }
            });
          } else {
            navigate('/demands');
          }
        },
        booking_created: () => {
          // راكب حجز رحلتك - انتقل إلى صفحة الحجوزات
          navigate('/bookings', {
            state: {
              tab: 'received', // عرض تبويب الحجوزات المستلمة
              highlightBookingId: notification.relatedId
            }
          });
        },
        booking_accepted: () => {
          // تم قبول حجزك
          navigate('/bookings');
        },
        booking_rejected: () => {
          // تم رفض حجزك
          navigate('/bookings');
        },
        new_message: () => {
          // رسالة جديدة
          navigate('/messages');
        },
        trip_reminder: () => {
          // تذكير برحلة قادمة
          navigate('/');
        }
      };

      routes[notification.type]?.();
      onClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // آخر 10 إشعارات فقط
  const recentNotifications = notifications.slice(0, 10);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        left: 0,
        marginTop: '8px',
        width: '360px',
        maxWidth: '90vw',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        maxHeight: '480px',
        overflow: 'hidden',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out',
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(to bottom, #f9fafb, white)'
        }}
      >
        <h3
          style={{
            fontWeight: '700',
            fontSize: '1.125rem',
            fontFamily: '"Cairo", sans-serif',
            color: '#111827'
          }}
        >
          الإشعارات
        </h3>
        {recentNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              fontSize: '0.875rem',
              color: '#3b82f6',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: '"Cairo", sans-serif',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#3b82f6';
            }}
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* Body - Scrollable */}
      <div
        style={{
          maxHeight: '320px',
          overflowY: 'auto'
        }}
      >
        {loading ? (
          <NotificationSkeleton count={3} />
        ) : recentNotifications.length === 0 ? (
          <div
            style={{
              padding: '48px 32px',
              textAlign: 'center',
              color: '#6b7280'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🔔</div>
            <p
              style={{
                fontWeight: '600',
                marginBottom: '8px',
                fontFamily: '"Cairo", sans-serif',
                color: '#374151'
              }}
            >
              لا توجد إشعارات
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              ستظهر هنا جميع التحديثات المهمة
            </p>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid #f3f4f6' }}>
            {recentNotifications.map((notification, index) => (
              <div
                key={notification.id}
                style={{
                  borderBottom: index < recentNotifications.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <NotificationItem
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  compact={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            background: 'linear-gradient(to top, #f9fafb, white)',
            textAlign: 'center'
          }}
        >
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            style={{
              fontSize: '0.875rem',
              color: '#3b82f6',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: '"Cairo", sans-serif',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#3b82f6';
            }}
          >
            عرض جميع الإشعارات ←
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default NotificationDropdown;
