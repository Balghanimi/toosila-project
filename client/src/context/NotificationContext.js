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
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [isFirstFetch, setIsFirstFetch] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    console.log('[NOTIFICATION] 🎵 playNotificationSound called');
    try {
      // Simple notification beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[NOTIFICATION] 🎵 AudioContext created:', audioContext.state);

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      console.log('[NOTIFICATION] ✅ Sound played successfully');
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Could not play notification sound:', error);
    }
  }, []);

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
      setPreviousUnreadCount(0);
      return;
    }

    try {
      const response = await messagesAPI.getUnreadCount();
      console.log('[NOTIFICATION] 📡 Raw API Response:', response);
      // FIX: API returns unreadCount, not count
      const newCount = response.unreadCount || response.count || 0;

      console.log('[NOTIFICATION] 📊 Count check:', {
        previous: previousUnreadCount,
        new: newCount,
        increased: newCount > previousUnreadCount,
        isFirstFetch,
        responseObject: response,
      });

      // Play sound if count increased (new message received)
      // Skip sound on first fetch to avoid false positives on app load
      if (newCount > previousUnreadCount && !isFirstFetch) {
        console.log('[NOTIFICATION] 🔔 New message detected! Playing sound...');
        playNotificationSound();
      }

      // Mark first fetch as complete
      if (isFirstFetch) {
        console.log('[NOTIFICATION] ✅ First fetch complete, baseline set to:', newCount);
        setIsFirstFetch(false);
      }

      setPreviousUnreadCount(newCount);
      setUnreadMessages(newCount);
      console.log('[NOTIFICATION] 💾 Updated counts - unread:', newCount);
    } catch (error) {
      console.error('[NOTIFICATION] ❌ Error fetching unread count:', error);
      // Silently fail - backend might not have messages API implemented yet
      setUnreadMessages(0);
    }
  }, [currentUser, previousUnreadCount, isFirstFetch, playNotificationSound]);

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
    if (!currentUser) {
      console.log('[NOTIFICATION] ⏸️ Polling stopped - no user logged in');
      return;
    }

    console.log('[NOTIFICATION] ▶️ Starting message polling for user:', currentUser.name);

    // Initial fetch
    fetchUnreadCount();

    // Set up polling
    const interval = setInterval(() => {
      console.log('[NOTIFICATION] 🔄 Polling for new messages...');
      fetchUnreadCount();
    }, 10000); // 10 seconds

    return () => {
      console.log('[NOTIFICATION] ⏹️ Stopping message polling');
      clearInterval(interval);
    };
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
