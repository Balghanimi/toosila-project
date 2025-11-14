import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { bookingsAPI, messagesAPI } from '../services/api';
import { ToastContainer } from '../components/UI/Toast';

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
  const showToast = useCallback((message, variant = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      variant,
      duration: options.duration || 5000,
      description: options.description,
      position: options.position || 'top-center',
      icon: options.icon,
      action: options.action,
    };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};
