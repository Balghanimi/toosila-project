import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { bookingsAPI, messagesAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [pendingBookings, setPendingBookings] = useState({
    receivedPending: 0,
    sentPending: 0,
    totalPending: 0,
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Fetch pending bookings count
  const fetchPendingCount = useCallback(async () => {
    if (!currentUser) {
      setPendingBookings({ receivedPending: 0, sentPending: 0, totalPending: 0 });
      return;
    }

    try {
      const response = await bookingsAPI.getPendingCount();
      setPendingBookings(response);
    } catch (error) {
      // Silently fail - backend might not have bookings API implemented yet
      setPendingBookings({ receivedPending: 0, sentPending: 0, totalPending: 0 });
    }
  }, [currentUser]);

  // Fetch unread messages count
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) {
      setUnreadMessages(0);
      return;
    }

    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadMessages(response.count || 0);
    } catch (error) {
      // Silently fail - backend might not have messages API implemented yet
      setUnreadMessages(0);
    }
  }, [currentUser]);

  // Polling for bookings every 30 seconds
  useEffect(() => {
    if (!currentUser) return;

    // Initial fetch
    fetchPendingCount();

    // Set up polling
    const interval = setInterval(fetchPendingCount, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, fetchPendingCount]);

  // Polling for messages every 10 seconds
  useEffect(() => {
    if (!currentUser) return;

    // Initial fetch
    fetchUnreadCount();

    // Set up polling
    const interval = setInterval(fetchUnreadCount, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [currentUser, fetchUnreadCount]);

  // Remove toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show toast notification
  const showToast = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = Date.now();
      const toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [removeToast]
  );

  // Helper methods for different toast types
  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message) => showToast(message, 'warning'), [showToast]);
  const showInfo = useCallback((message) => showToast(message, 'info'), [showToast]);

  const value = {
    pendingBookings,
    fetchPendingCount,
    unreadMessages,
    fetchUnreadCount,
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        maxWidth: '90%',
        width: '400px',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return { bg: '#34c759', icon: '✅' };
      case 'error':
        return { bg: '#dc2626', icon: '❌' };
      case 'warning':
        return { bg: '#fbbf24', icon: '⚠️' };
      default:
        return { bg: '#3b82f6', icon: 'ℹ️' };
    }
  };

  const { bg, icon } = getToastColor();

  return (
    <div
      style={{
        background: bg,
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        fontFamily: '"Cairo", sans-serif',
        animation: 'slideInDown 0.3s ease-out',
        minHeight: '60px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
        <span style={{ fontSize: 'var(--text-2xl)' }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: '600' }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 'var(--text-lg)',
          color: 'white',
          flexShrink: 0,
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
