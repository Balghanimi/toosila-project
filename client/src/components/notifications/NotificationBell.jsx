/**
 * NotificationBell Component
 * أيقونة الجرس في Navbar مع دعم الإشعارات الفورية
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationsContext';
import { useSocket } from '../../context/SocketContext';
import NotificationDropdown from './NotificationDropdown';

function NotificationBell() {
  const { unreadCount } = useNotifications();
  const { unreadCount: socketUnreadCount, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  // إغلاق الـ dropdown عند النقر خارجه
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="الإشعارات"
        style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* أيقونة الجرس */}
        <span
          style={{
            fontSize: '1.5rem',
            lineHeight: 1,
            color: '#374151'
          }}
        >
          🔔
        </span>

        {/* Connection Status Indicator (small dot if not connected) */}
        {!isConnected && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#f59e0b',
            border: '2px solid white'
          }} />
        )}

        {/* Badge العدد - combined from both contexts */}
        {(unreadCount + socketUnreadCount) > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '999px',
              minWidth: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontFamily: '"Cairo", sans-serif',
              animation: (unreadCount + socketUnreadCount) > 0 ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}
          >
            {(unreadCount + socketUnreadCount) > 9 ? '9+' : (unreadCount + socketUnreadCount)}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          dropdownRef={dropdownRef}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

export default NotificationBell;
