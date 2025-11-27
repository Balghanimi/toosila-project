import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { messagesAPI } from '../services/api';

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

export const MessagesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!currentUser) {
      setConversations([]);
      return;
    }

    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      // Silently fail - backend might not have messages API implemented yet
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      // Silently fail - backend might not have messages API implemented yet
      setUnreadCount(0);
    }
  }, [currentUser]);

  // Fetch specific conversation messages (by user ID - deprecated)
  const fetchConversation = useCallback(
    async (userId) => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await messagesAPI.getConversation(userId);
        setCurrentConversation(response.messages || []);

        // Auto mark as read when viewing conversation
        if (response.messages && response.messages.length > 0) {
          const unreadMessages = response.messages.filter(
            (msg) => msg.sender_id !== currentUser.id && !msg.read
          );
          for (const msg of unreadMessages) {
            await messagesAPI.markAsRead(msg.id);
          }
          // Refresh unread count after marking as read
          fetchUnreadCount();
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, fetchUnreadCount]
  );

  // Fetch ride-specific conversation messages (offer or demand)
  const fetchRideConversation = useCallback(
    async (rideType, rideId) => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await messagesAPI.getRideMessages(rideType, rideId);
        setCurrentConversation(response.messages || []);

        // Auto mark conversation as read
        if (response.messages && response.messages.length > 0) {
          try {
            await messagesAPI.markConversationAsRead(rideType, rideId);
            fetchUnreadCount();
          } catch (markError) {
            // Silently fail - marking as read is not critical
            console.warn('Could not mark conversation as read:', markError);
          }
        }
      } catch (error) {
        console.error('Error fetching ride conversation:', error);
        setCurrentConversation([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, fetchUnreadCount]
  );

  // Load conversations on mount
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [currentUser, fetchConversations, fetchUnreadCount]);

  // Send a message
  const sendMessage = async (rideType, rideId, content) => {
    if (!currentUser) return null;

    try {
      const response = await messagesAPI.sendMessage(rideType, rideId, content);

      // Refresh conversations after sending
      fetchConversations();

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Get messages (wrapper for backward compatibility)
  const getMessages = () => {
    return currentConversation;
  };

  // Get unread count (wrapper for backward compatibility)
  const getUnreadCount = () => {
    return unreadCount;
  };

  // Get conversations (wrapper for backward compatibility)
  const getUserConversations = () => {
    return conversations;
  };

  // Get total unread count (wrapper for backward compatibility)
  const getTotalUnreadCount = () => {
    return unreadCount;
  };

  const value = {
    conversations,
    currentConversation,
    unreadCount,
    loading,
    sendMessage,
    markAsRead,
    getMessages,
    getUnreadCount,
    getTotalUnreadCount,
    getUserConversations,
    fetchConversations,
    fetchConversation,
    fetchRideConversation,
    fetchUnreadCount,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};
