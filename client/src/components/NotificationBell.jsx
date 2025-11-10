/**
 * NotificationBell Component
 *
 * Displays a notification bell icon with unread count badge
 * Shows dropdown with recent notifications
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected,
    requestNotificationPermission,
  } = useSocket();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);

    // Navigate based on notification type
    switch (notification.type) {
      case 'new-booking':
        navigate('/bookings');
        break;
      case 'booking-status-updated':
        navigate('/bookings');
        break;
      case 'new-message':
        navigate('/messages');
        break;
      case 'new-demand-response':
        navigate('/demands');
        break;
      case 'demand-response-status-updated':
        navigate('/demands');
        break;
      default:
        navigate('/notifications');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;

    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: '0.5rem',
          color: 'var(--text-primary)',
          animation: shouldAnimate ? 'bellRing 0.5s ease-in-out' : 'none',
        }}
        aria-label="Notifications"
      >
        🔔
        {/* Connection Status Indicator */}
        {!isConnected && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
              border: '2px solid white',
            }}
          />
        )}
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: unreadCount > 9 ? '22px' : '18px',
              height: unreadCount > 9 ? '22px' : '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: '700',
              fontFamily: '"Cairo", sans-serif',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '350px',
            maxWidth: '90vw',
            maxHeight: '500px',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-2xl)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--surface-secondary)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                fontFamily: '"Cairo", sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              🔔 الإشعارات
            </h3>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  padding: '0.25rem 0.5rem',
                }}
              >
                قراءة الكل
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🔕</div>
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    background: notification.read ? 'transparent' : '#eff6ff',
                    transition: 'background 0.2s',
                    ':hover': {
                      background: 'var(--surface-secondary)',
                    },
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read
                      ? 'transparent'
                      : '#eff6ff';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        fontFamily: '"Cairo", sans-serif',
                        color: 'var(--text-primary)',
                        flex: 1,
                      }}
                    >
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          marginTop: '6px',
                          marginLeft: 'var(--space-2)',
                        }}
                      />
                    )}
                  </div>

                  <p
                    style={{
                      margin: '0 0 var(--space-2) 0',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif',
                      lineHeight: 1.5,
                    }}
                  >
                    {notification.message}
                  </p>

                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderTop: '1px solid var(--border-light)',
                textAlign: 'center',
                background: 'var(--surface-secondary)',
              }}
            >
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/notifications');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  padding: '0.5rem',
                }}
              >
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }

        @keyframes slideDown {
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
