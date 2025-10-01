import React, { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // Load messages from localStorage on app start
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('messages');
      const savedUnreadCounts = localStorage.getItem('unreadCounts');
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      if (savedUnreadCounts) {
        setUnreadCounts(JSON.parse(savedUnreadCounts));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  // Save unread counts to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
    } catch (error) {
      console.error('Error saving unread counts:', error);
    }
  }, [unreadCounts]);

  // Generate unique message ID
  const generateMessageId = () => {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Send a message
  const sendMessage = (senderId, receiverId, tripId, content) => {
    const messageId = generateMessageId();
    const newMessage = {
      id: messageId,
      senderId,
      receiverId,
      tripId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent' // sent, delivered, read
    };

    // Create conversation key (sorted to ensure consistency)
    const conversationKey = [senderId, receiverId, tripId].sort().join('_');
    
    setMessages(prev => ({
      ...prev,
      [conversationKey]: [
        ...(prev[conversationKey] || []),
        newMessage
      ]
    }));

    // Update unread count for receiver
    const receiverKey = `${receiverId}_${tripId}`;
    setUnreadCounts(prev => ({
      ...prev,
      [receiverKey]: (prev[receiverKey] || 0) + 1
    }));

    // Simulate message delivery after a short delay
    setTimeout(() => {
      updateMessageStatus(messageId, conversationKey, 'delivered');
    }, 1000);

    return newMessage;
  };

  // Update message status (sent -> delivered -> read)
  const updateMessageStatus = (messageId, conversationKey, status) => {
    setMessages(prev => {
      if (!prev[conversationKey]) return prev;
      
      return {
        ...prev,
        [conversationKey]: prev[conversationKey].map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        )
      };
    });
  };

  // Mark messages as read
  const markAsRead = (userId, tripId, senderId) => {
    const conversationKey = [userId, senderId, tripId].sort().join('_');
    const receiverKey = `${userId}_${tripId}`;
    
    setMessages(prev => {
      if (!prev[conversationKey]) return prev;
      
      return {
        ...prev,
        [conversationKey]: prev[conversationKey].map(msg => 
          msg.senderId === senderId && !msg.read 
            ? { ...msg, read: true, status: 'read' }
            : msg
        )
      };
    });

    // Reset unread count
    setUnreadCounts(prev => ({
      ...prev,
      [receiverKey]: 0
    }));
  };

  // Get messages for a conversation
  const getMessages = (userId1, userId2, tripId) => {
    const conversationKey = [userId1, userId2, tripId].sort().join('_');
    return messages[conversationKey] || [];
  };

  // Get unread count for a user and trip
  const getUnreadCount = (userId, tripId) => {
    const key = `${userId}_${tripId}`;
    return unreadCounts[key] || 0;
  };

  // Get all conversations for a user
  const getUserConversations = (userId) => {
    const conversations = [];
    
    Object.keys(messages).forEach(conversationKey => {
      const [user1, user2, tripId] = conversationKey.split('_');
      if (user1 === userId || user2 === userId) {
        const conversationMessages = messages[conversationKey];
        if (conversationMessages && conversationMessages.length > 0) {
          const lastMessage = conversationMessages[conversationMessages.length - 1];
          const otherUserId = user1 === userId ? user2 : user1;
          
          conversations.push({
            tripId,
            otherUserId,
            lastMessage,
            unreadCount: getUnreadCount(userId, tripId)
          });
        }
      }
    });

    // Sort by last message timestamp
    return conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  };

  // Clear all messages (for testing)
  const clearAllMessages = () => {
    setMessages({});
    setUnreadCounts({});
  };

  // Search messages across all conversations
  const searchMessages = (userId, searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    const searchResults = [];
    const userMessages = messages[userId] || {};
    
    Object.entries(userMessages).forEach(([otherUserId, conversations]) => {
      Object.entries(conversations).forEach(([tripId, conversationMessages]) => {
        conversationMessages.forEach(message => {
          if (message.content.toLowerCase().includes(searchTerm.toLowerCase())) {
            searchResults.push({
              ...message,
              otherUserId,
              tripId,
              conversationKey: `${userId}_${otherUserId}_${tripId}`
            });
          }
        });
      });
    });
    
    // Sort by timestamp (newest first)
    return searchResults.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  // Search conversations by user name or message content
  const searchConversations = (userId, searchTerm) => {
    if (!searchTerm.trim()) return getUserConversations(userId);
    
    const conversations = getUserConversations(userId);
    const searchLower = searchTerm.toLowerCase();
    
    return conversations.filter(conversation => {
      // Search in user name
      if (conversation.otherUserName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in last message content
      if (conversation.lastMessage.content.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in trip info
      if (conversation.tripInfo?.from?.toLowerCase().includes(searchLower) ||
          conversation.tripInfo?.to?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
  };

  // Get message statistics
  const getMessageStats = (userId) => {
    const userMessages = messages[userId] || {};
    let totalMessages = 0;
    let totalConversations = 0;
    let totalUnread = 0;
    
    Object.values(userMessages).forEach(conversations => {
      Object.values(conversations).forEach(conversationMessages => {
        totalMessages += conversationMessages.length;
        totalConversations++;
        
        // Count unread messages
        conversationMessages.forEach(message => {
          if (message.senderId !== userId && !message.read) {
            totalUnread++;
          }
        });
      });
    });
    
    return {
      totalMessages,
      totalConversations,
      totalUnread,
      averageMessagesPerConversation: totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0
    };
  };

  const value = {
    messages,
    unreadCounts,
    sendMessage,
    markAsRead,
    updateMessageStatus,
    getMessages,
    getUnreadCount,
    getUserConversations,
    clearAllMessages,
    searchMessages,
    searchConversations,
    getMessageStats
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
