import React, { useState, useEffect } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatInterface = ({
  tripId,
  otherUserId,
  otherUserName,
  tripInfo,
  onClose
}) => {
  const { sendMessage, currentConversation, fetchConversation, loading } = useMessages();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load messages for this conversation
  useEffect(() => {
    if (otherUserId && user?.id) {
      fetchConversation(otherUserId);
    }
  }, [otherUserId, user?.id, fetchConversation]);

  // Handle sending a message
  const handleSendMessage = async (content) => {
    if (!user?.id || !tripId || !content.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Assuming rideType is 'offer' for now - this should be passed as prop
      await sendMessage('offer', tripId, content);

      showSuccess('✅ تم إرسال الرسالة بنجاح!');

      // Refresh conversation
      fetchConversation(otherUserId);

    } catch (err) {
      const errorMsg = err.message || 'فشل في إرسال الرسالة. حاول مرة أخرى.';
      setError(errorMsg);
      showError(errorMsg);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format trip info for display
  const formatTripInfo = () => {
    if (!tripInfo) return '';
    
    const { from, to, date, time } = tripInfo;
    const formattedDate = new Date(date).toLocaleDateString('ar-IQ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    return `${from} → ${to} • ${formattedDate} ${time}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--surface-primary)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border-light)',
      direction: 'rtl'
    }}>
      {/* Chat Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        color: 'white',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* User Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            fontWeight: '700',
            fontFamily: '"Cairo", sans-serif'
          }}>
            {otherUserName?.charAt(0) || '👤'}
          </div>
          
          {/* User Info */}
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              fontFamily: '"Cairo", sans-serif'
            }}>
              {otherUserName || 'مستخدم'}
            </h3>
            {tripInfo && (
              <p style={{
                margin: 0,
                fontSize: 'var(--text-sm)',
                opacity: 0.9,
                fontFamily: '"Cairo", sans-serif'
              }}>
                {formatTripInfo()}
              </p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--error-light)',
          color: 'var(--error)',
          fontSize: 'var(--text-sm)',
          fontFamily: '"Cairo", sans-serif',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-light)'
        }}>
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <MessageList
          messages={currentConversation}
          currentUserId={user?.id}
        />
      </div>

      {/* Message Input */}
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--surface-primary)',
        borderTop: '1px solid var(--border-light)'
      }}>
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="اكتب رسالتك هنا..."
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            fontFamily: '"Cairo", sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid var(--border-light)',
              borderTop: '2px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            جاري الإرسال...
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
