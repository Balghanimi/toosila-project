/**
 * NotificationsPage
 * صفحة كاملة لعرض جميع الإشعارات مع فلترة
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import NotificationItem from '../components/notifications/NotificationItem';
import NotificationSkeleton from '../components/notifications/NotificationSkeleton';

function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read

  // فلترة الإشعارات
  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    if (filter === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount = useMemo(() => notifications.filter((n) => n.isRead).length, [notifications]);

  // معالجة النقر على إشعار
  const handleNotificationClick = async (notification) => {
    try {
      // تحديد كمقروء
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // استخراج البيانات من data object
      const data = notification.data || {};

      // الانتقال حسب نوع الإشعار
      const routes = {
        demand_response: () => {
          if (data.demandId) {
            navigate('/demands', {
              state: {
                openDemandId: data.demandId,
                action: 'viewResponses',
              },
            });
          } else {
            navigate('/demands');
          }
        },
        response_accepted: () => {
          if (data.demandId) {
            navigate('/demands', {
              state: {
                openDemandId: data.demandId,
                action: 'viewResponses',
              },
            });
          } else {
            navigate('/demands');
          }
        },
        response_rejected: () => {
          if (data.demandId) {
            navigate('/demands', {
              state: {
                openDemandId: data.demandId,
                action: 'viewResponses',
              },
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
              highlightBookingId: data.bookingId || data.booking_id,
            },
          });
        },
        booking_accepted: () => {
          if (data.bookingId || data.booking_id) {
            navigate('/bookings', {
              state: {
                highlightBookingId: data.bookingId || data.booking_id,
              },
            });
          } else {
            navigate('/bookings');
          }
        },
        booking_rejected: () => {
          if (data.bookingId || data.booking_id) {
            navigate('/bookings', {
              state: {
                highlightBookingId: data.bookingId || data.booking_id,
              },
            });
          } else {
            navigate('/bookings');
          }
        },
        new_message: () => navigate('/messages'),
        trip_reminder: () => navigate('/'),
      };

      routes[notification.type]?.();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // معالجة حذف إشعار
  const handleDelete = async (notificationId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      try {
        await deleteNotification(notificationId);
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('حدث خطأ أثناء حذف الإشعار');
      }
    }
  };

  // معالجة "تحديد الكل كمقروء"
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        paddingTop: '24px',
        paddingBottom: '100px',
      }}
    >
      <div
        style={{
          maxWidth: '768px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h1
                style={{
                  fontSize: '1.875rem',
                  fontWeight: '800',
                  color: 'white',
                  fontFamily: '"Cairo", sans-serif',
                  textAlign: 'right',
                  margin: 0,
                }}
              >
                الإشعارات
              </h1>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    fontSize: '0.875rem',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontFamily: '"Cairo", sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ✓ تحديد الكل كمقروء
                </button>
              )}
            </div>
          </div>

          {/* Filters/Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '16px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <button
              onClick={() => setFilter('all')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                fontSize: '0.9375rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                background:
                  filter === 'all' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                color: filter === 'all' ? 'white' : '#374151',
                boxShadow: filter === 'all' ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              الكل
              <span style={{ marginRight: '8px', fontSize: '0.875rem' }}>
                ({notifications.length})
              </span>
            </button>

            <button
              onClick={() => setFilter('unread')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                fontSize: '0.9375rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                background:
                  filter === 'unread'
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'white',
                color: filter === 'unread' ? 'white' : '#374151',
                boxShadow: filter === 'unread' ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              غير مقروءة
              <span style={{ marginRight: '8px', fontSize: '0.875rem' }}>({unreadCount})</span>
              {unreadCount > 0 && filter !== 'unread' && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '12px',
                    height: '12px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                ></span>
              )}
            </button>

            <button
              onClick={() => setFilter('read')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                fontSize: '0.9375rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                background:
                  filter === 'read' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                color: filter === 'read' ? 'white' : '#374151',
                boxShadow: filter === 'read' ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              مقروءة
              <span style={{ marginRight: '8px', fontSize: '0.875rem' }}>({readCount})</span>
            </button>
          </div>

          {/* List */}
          <div
            style={{
              borderTop: '1px solid #f3f4f6',
            }}
          >
            {loading ? (
              <NotificationSkeleton count={5} />
            ) : filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '80px 32px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '5rem',
                    marginBottom: '16px',
                    opacity: 0.5,
                  }}
                >
                  {filter === 'unread' ? '✅' : filter === 'read' ? '📭' : '🔔'}
                </div>
                <p
                  style={{
                    color: '#6b7280',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: '"Cairo", sans-serif',
                    fontSize: '1.125rem',
                  }}
                >
                  {filter === 'unread' && 'لا توجد إشعارات غير مقروءة'}
                  {filter === 'read' && 'لا توجد إشعارات مقروءة'}
                  {filter === 'all' && 'لا توجد إشعارات'}
                </p>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#9ca3af',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  ستظهر هنا جميع التحديثات المهمة
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{
                    borderBottom:
                      index < filteredNotifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <NotificationItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    showDelete={true}
                    onDelete={handleDelete}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
