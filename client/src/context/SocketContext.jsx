/**
 * Socket.io Context - Real-time Notifications
 *
 * Provides real-time notification functionality across the app using Socket.io
 * Handles connection, disconnection, and all notification events
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Notification sound (using data URI for a simple beep)
const NOTIFICATION_SOUND = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSA0PVqzn77BXFwxKo+Hyu2sfBDOK0/PQfS0GH2+/7+OYRw0QV63o8LBYFw1MpOLyu2weBDSM1PPPfywGH2+/7uOXRw0RWK7o8LBZGQ5NpePyu20fBTaO1fPOfiwGIG++7+SXRw0RWK/o8LBZGQ5OpeTyu24gBTiQ1vPNfisGIG6+7+SWRg0RWK/o77BZGQ5PpuTyu28hBTmS1/PNfioGIG6+7+SWRg0RWK/o77BZGQ5PpuTyu28hBTmS1/PNfioGIG6+7+SWRg0RWK/o77BZGg5PpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ0QV67n77BZGg5QpuTyu3AiBTqT2PPMfSgGH26+7uSVRQ==');

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const previousTokenRef = useRef(null);

  // Initialize socket connection - Only reconnect when token changes
  useEffect(() => {
    const currentToken = currentUser?.token;

    // If token hasn't changed, don't reconnect
    if (currentToken === previousTokenRef.current) {
      return;
    }

    // Update previous token ref
    previousTokenRef.current = currentToken;

    if (!currentUser || !currentToken) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to Socket.io server
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    const newSocket = io(backendURL, {
      auth: {
        token: currentUser.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('connected', (data) => {
      // Connected successfully
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
      setIsConnected(false);
    });

    // Notification event listeners
    newSocket.on('new-booking', handleNewBooking);
    newSocket.on('booking-status-updated', handleBookingStatusUpdate);
    newSocket.on('new-message', handleNewMessage);
    newSocket.on('new-demand-response', handleNewDemandResponse);
    newSocket.on('demand-response-status-updated', handleDemandResponseStatusUpdate);

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.off('new-booking', handleNewBooking);
      newSocket.off('booking-status-updated', handleBookingStatusUpdate);
      newSocket.off('new-message', handleNewMessage);
      newSocket.off('new-demand-response', handleNewDemandResponse);
      newSocket.off('demand-response-status-updated', handleDemandResponseStatusUpdate);
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Notification handlers
  const handleNewBooking = useCallback((data) => {
    addNotification(data);
    playNotificationSound();
    showBrowserNotification(data.title, data.message);
  }, []);

  const handleBookingStatusUpdate = useCallback((data) => {
    addNotification(data);
    playNotificationSound();
    showBrowserNotification(data.title, data.message);
  }, []);

  const handleNewMessage = useCallback((data) => {
    addNotification(data);
    playNotificationSound();
    showBrowserNotification(data.title, data.message);
  }, []);

  const handleNewDemandResponse = useCallback((data) => {
    addNotification(data);
    playNotificationSound();
    showBrowserNotification(data.title, data.message);
  }, []);

  const handleDemandResponseStatusUpdate = useCallback((data) => {
    addNotification(data);
    playNotificationSound();
    showBrowserNotification(data.title, data.message);
  }, []);

  // Add notification to state
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      NOTIFICATION_SOUND.play().catch(() => {
        // Sound play failed silently
      });
    } catch (error) {
      // Sound error - fail silently
    }
  };

  // Show browser notification
  const showBrowserNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'toosila-notification'
        });
      } catch (error) {
        // Notification error - fail silently
      }
    }
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    requestNotificationPermission
  }), [socket, isConnected, notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, requestNotificationPermission]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}

export default SocketContext;
