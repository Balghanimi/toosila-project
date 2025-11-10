import React, { useState, useEffect } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';
import MessageSearch from './MessageSearch';

const ConversationList = ({ onSelectConversation, selectedConversation }) => {
  const { conversations, fetchConversations } = useMessages();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Load conversations
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id, fetchConversations]);

  // Filter conversations based on search
  const filteredConversations = searchTerm
    ? conversations.filter(
        (conv) =>
          conv.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'الآن';
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString('ar-IQ', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (diffInHours < 48) {
        return 'أمس';
      } else {
        return date.toLocaleDateString('ar-IQ', {
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      return timestamp;
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (conversations.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-base)',
          fontFamily: '"Cairo", sans-serif',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💬</div>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              marginBottom: 'var(--space-2)',
            }}
          >
            لا توجد محادثات بعد
          </div>
          <div style={{ fontSize: 'var(--text-sm)' }}>
            ابدأ محادثة جديدة من صفحة العروض أو الطلبات
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        direction: 'rtl',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-4)',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          color: 'white',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            المحادثات ({conversations.length})
          </h3>
          <button
            onClick={() => setShowAdvancedSearch(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2)',
              cursor: 'pointer',
              color: 'white',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            🔍 بحث متقدم
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="البحث في المحادثات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--text-primary)',
              outline: 'none',
              direction: 'rtl',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'var(--text-lg)',
              color: 'var(--text-muted)',
            }}
          >
            🔍
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {filteredConversations.map((conversation, index) => {
          const isSelected = selectedConversation?.tripId === conversation.tripId;
          const hasUnread = conversation.unreadCount > 0;

          return (
            <div
              key={`${conversation.tripId}_${conversation.otherUserId}`}
              onClick={() => onSelectConversation(conversation)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                background: isSelected ? 'var(--surface-secondary)' : 'transparent',
                transition: 'var(--transition)',
                animationDelay: `${index * 0.05}s`,
                animation: 'fadeInUp 0.3s ease-out',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.target.style.background = 'var(--surface-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {/* User Avatar */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: hasUnread
                    ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                    : 'var(--surface-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-lg)',
                  fontWeight: '700',
                  color: hasUnread ? 'white' : 'var(--text-primary)',
                  fontFamily: '"Cairo", sans-serif',
                  marginLeft: 'var(--space-3)',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {conversation.otherUserName?.charAt(0) || '👤'}

                {/* Unread indicator */}
                {hasUnread && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '16px',
                      height: '16px',
                      background: 'var(--error)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-xs)',
                      fontWeight: '700',
                      color: 'white',
                      border: '2px solid white',
                    }}
                  >
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </div>
                )}
              </div>

              {/* Conversation Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-base)',
                      fontWeight: hasUnread ? '700' : '600',
                      color: hasUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {conversation.otherUserName || 'مستخدم'}
                  </h4>

                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: hasUnread ? 'var(--primary)' : 'var(--text-muted)',
                      fontFamily: '"Cairo", sans-serif',
                      fontWeight: hasUnread ? '600' : '500',
                      flexShrink: 0,
                      marginRight: 'var(--space-2)',
                    }}
                  >
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    color: hasUnread ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif',
                    fontWeight: hasUnread ? '600' : '500',
                    lineHeight: '1.4',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncateMessage(conversation.lastMessage.content)}
                </p>
              </div>

              {/* Status Indicator */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  marginRight: 'var(--space-2)',
                }}
              >
                {conversation.lastMessage.senderId === user?.id && (
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: conversation.lastMessage.read ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {conversation.lastMessage.read ? '✓✓' : '✓'}
                  </div>
                )}

                {hasUnread && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      background: 'var(--primary)',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Search */}
      {filteredConversations.length === 0 && searchTerm && (
        <div
          style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: '"Cairo", sans-serif',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🔍</div>
          <div>لم يتم العثور على محادثات</div>
          <div style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            جرب مصطلحات بحث مختلفة
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <MessageSearch
          onSelectMessage={(result) => {
            // Handle message selection
            if (result.conversationKey) {
              const [, otherUserId, tripId] = result.conversationKey.split('_');
              const conversation = {
                tripId,
                otherUserId,
                otherUserName: result.otherUserId,
                lastMessage: result,
              };
              onSelectConversation(conversation);
            }
          }}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  );
};

export default ConversationList;
