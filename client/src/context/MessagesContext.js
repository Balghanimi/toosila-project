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
  const [currentConversationKey, setCurrentConversationKey] = useState(null); // Track active conversation
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Clear current conversation (call before switching)
  const clearCurrentConversation = useCallback(() => {
    console.log('[MESSAGES] 🧹 Clearing current conversation state');
    setCurrentConversation([]);
    setCurrentConversationKey(null);
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!currentUser) {
      setConversations([]);
      return;
    }

    try {
      setLoading(true);
      console.log('[MESSAGES] 📥 Fetching conversations list...');
      const response = await messagesAPI.getConversations();
      console.log('[MESSAGES] 📨 Conversations API Response:', {
        conversationsCount: response.conversations?.length || 0,
        total: response.total,
        conversations: response.conversations,
      });
      setConversations(response.conversations || []);
    } catch (error) {
      // Silently fail - backend might not have messages API implemented yet
      console.error('[MESSAGES] ❌ Error fetching conversations:', error);
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
    async (rideType, rideId, otherUserId = null) => {
      if (!currentUser) return;

      // Create unique key for this conversation
      const conversationKey = `${rideType}-${rideId}-${otherUserId || 'all'}`;

      // CRITICAL FIX: Check if we're switching to a different conversation
      setCurrentConversationKey((prevKey) => {
        if (prevKey && prevKey !== conversationKey) {
          console.log(
            '[MESSAGES] 🧹 Switching conversation - clearing old messages:',
            prevKey,
            '->',
            conversationKey
          );
          setCurrentConversation([]);
        }
        return conversationKey; // Update to new key
      });

      try {
        setLoading(true);
        console.log('[MESSAGES] 📥 Fetching ride conversation:', {
          rideType,
          rideId,
          otherUserId,
          conversationKey,
        });

        const response = await messagesAPI.getRideMessages(rideType, rideId, 1, 50, otherUserId);

        // Only update if this is still the active conversation (prevents race conditions)
        setCurrentConversationKey((prevKey) => {
          if (prevKey === conversationKey) {
            console.log(
              '[MESSAGES] 📨 Updating conversation:',
              conversationKey,
              'with',
              response.messages?.length || 0,
              'messages'
            );
            setCurrentConversation(response.messages || []);
          } else {
            console.log('[MESSAGES] ⚠️ Conversation changed during fetch, skipping stale update');
          }
          return prevKey;
        });

        // Auto mark conversation as read
        if (response.messages && response.messages.length > 0) {
          try {
            await messagesAPI.markConversationAsRead(rideType, rideId);
            fetchUnreadCount();
          } catch (markError) {
            console.warn('Could not mark conversation as read:', markError);
          }
        }
      } catch (error) {
        console.error('[MESSAGES] ❌ Error fetching ride conversation:', error);
        // Only clear if still on this conversation
        setCurrentConversationKey((prevKey) => {
          if (prevKey === conversationKey) {
            setCurrentConversation([]);
          }
          return prevKey;
        });
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

  // Send a message with optimistic update
  const sendMessage = async (rideType, rideId, content) => {
    if (!currentUser) return null;

    // Create optimistic message immediately
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUser.id,
      senderName: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date().toISOString(),
      rideType,
      rideId,
      isOptimistic: true, // Flag to show sending state
    };

    // Add to conversation immediately (optimistic update)
    setCurrentConversation((prev) => [...prev, optimisticMessage]);

    try {
      const response = await messagesAPI.sendMessage(rideType, rideId, content);

      // Replace optimistic message with real one from server
      setCurrentConversation((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? {
                ...response.messageData,
                id: response.messageData.id,
                senderId: response.messageData.sender_id || response.messageData.senderId,
                senderName: response.messageData.sender_name || response.messageData.senderName,
                createdAt: response.messageData.created_at || response.messageData.createdAt,
              }
            : msg
        )
      );

      // Refresh conversations list in background (don't block)
      fetchConversations();

      return response;
    } catch (error) {
      console.error('Error sending message:', error);

      // Remove optimistic message on error
      setCurrentConversation((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));

      throw error;
    }
  };

  // Edit message
  const editMessage = async (messageId, content) => {
    try {
      const response = await messagesAPI.editMessage(messageId, content);

      // Update message in current conversation
      setCurrentConversation((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content, isEdited: true, lastEditedAt: new Date().toISOString() }
            : msg
        )
      );

      return response;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };

  // Delete message
  const deleteMessage = async (messageId, deleteForAll = false) => {
    try {
      const response = await messagesAPI.deleteMessage(messageId, deleteForAll);

      if (deleteForAll) {
        // Mark as deleted for everyone in UI
        setCurrentConversation((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: 'تم حذف هذه الرسالة', isDeleted: true, deletedForEveryone: true }
              : msg
          )
        );
      } else {
        // Remove from UI for "delete for me"
        setCurrentConversation((prev) => prev.filter((msg) => msg.id !== messageId));
      }

      return response;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  // Delete entire conversation
  const deleteConversation = async (rideType, rideId) => {
    try {
      const response = await messagesAPI.deleteConversation(rideType, rideId);

      // Clear current conversation if it's the one being deleted
      if (currentConversationKey === `${rideType}-${rideId}`) {
        setCurrentConversation([]);
        setCurrentConversationKey(null);
      }

      // Refresh conversations list
      fetchConversations();

      return response;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  };

  // Update message in current conversation (for Socket.io real-time updates)
  const updateMessageInConversation = (updatedMessage) => {
    setCurrentConversation((prev) =>
      prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg))
    );
  };

  // Remove message from conversation (for Socket.io delete events)
  const removeMessageFromConversation = (messageId) => {
    setCurrentConversation((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: 'تم حذف هذه الرسالة', isDeleted: true } : msg
      )
    );
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
    currentConversationKey,
    unreadCount,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    deleteConversation,
    markAsRead,
    getMessages,
    getUnreadCount,
    getTotalUnreadCount,
    getUserConversations,
    fetchConversations,
    fetchConversation,
    fetchRideConversation,
    fetchUnreadCount,
    clearCurrentConversation,
    updateMessageInConversation,
    removeMessageFromConversation,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};
