import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUserId, onMarkAsRead }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0 && onMarkAsRead) {
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== currentUserId && !msg.read
      );
      
      if (unreadMessages.length > 0) {
        // Get the sender ID from the first unread message
        const senderId = unreadMessages[0].senderId;
        const tripId = unreadMessages[0].tripId;
        onMarkAsRead(currentUserId, tripId, senderId);
      }
    }
  }, [messages, currentUserId, onMarkAsRead]);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('ar-IQ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('ar-IQ', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return timestamp;
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-base)',
        fontFamily: '"Cairo", sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>💬</div>
          <div>لا توجد رسائل بعد</div>
          <div style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            ابدأ المحادثة الآن
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: 'var(--space-4)',
      background: 'var(--surface-secondary)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-4)',
      maxHeight: '400px',
      direction: 'rtl'
    }}>
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === currentUserId;
        const showDate = index === 0 || 
          new Date(message.timestamp).toDateString() !== 
          new Date(messages[index - 1].timestamp).toDateString();

        return (
          <div key={message.id}>
            {/* Date separator */}
            {showDate && (
              <div style={{
                textAlign: 'center',
                margin: 'var(--space-4) 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                fontFamily: '"Cairo", sans-serif'
              }}>
                {new Date(message.timestamp).toLocaleDateString('ar-IQ', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}

            {/* Message bubble */}
            <div style={{
              display: 'flex',
              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              marginBottom: 'var(--space-2)',
              animation: 'fadeInUp 0.3s ease-out'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: isOwnMessage 
                  ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                  : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                background: isOwnMessage 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                  : 'var(--surface-primary)',
                color: isOwnMessage ? 'white' : 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                border: isOwnMessage ? 'none' : '1px solid var(--border-light)',
                position: 'relative'
              }}>
                {/* Message content */}
                <div style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: '1.5',
                  fontFamily: '"Cairo", sans-serif',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.content}
                </div>

                {/* Message timestamp and read status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginTop: 'var(--space-1)',
                  fontSize: 'var(--text-xs)',
                  opacity: 0.7,
                  gap: 'var(--space-1)'
                }}>
                  <span style={{
                    fontFamily: '"Cairo", sans-serif',
                    color: isOwnMessage ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)'
                  }}>
                    {formatTime(message.timestamp)}
                  </span>
                  
                  {/* Message status indicators for own messages */}
                  {isOwnMessage && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {message.status === 'sent' && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>✓</span>
                      )}
                      {message.status === 'delivered' && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>✓✓</span>
                      )}
                      {message.status === 'read' && (
                        <span style={{ color: '#4ade80' }}>✓✓</span>
                      )}
                    </div>
                  )}
                  
                  {/* Read indicator for received messages */}
                  {!isOwnMessage && message.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: 'var(--primary)',
                      borderRadius: '50%',
                      marginRight: 'var(--space-1)'
                    }} />
                  )}
                </div>

                {/* Message status indicator */}
                {!isOwnMessage && !message.read && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
