import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { useMessages } from '../../context/MessagesContext';
import MessageContextMenu from './MessageContextMenu';
import EditMessageModal from './EditMessageModal';

const MessageList = ({ messages, currentUserId, onMarkAsRead }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Connect to MessagesContext for edit/delete functions
  const { editMessage, deleteMessage } = useMessages();

  // State for context menu and edit modal
  const [contextMenu, setContextMenu] = useState(null); // { message, position, isOwnMessage }
  const [editingMessage, setEditingMessage] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Long press handling for mobile
  const longPressTimer = useRef(null);
  const longPressThreshold = 500; // 500ms for long press

  // Scroll tracking refs
  const prevMessageCountRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const isNearBottomRef = useRef(true);

  // Check if user is near bottom of scroll container
  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100; // 100px from bottom is considered "near bottom"
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Update isNearBottom when user scrolls
  const handleScroll = useCallback(() => {
    isNearBottomRef.current = checkIfNearBottom();
  }, [checkIfNearBottom]);

  // Scroll to bottom helper - SYNCHRONOUS for initial load
  const scrollToBottom = useCallback((behavior = 'auto') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  // NUCLEAR FIX: Use useLayoutEffect for synchronous scroll BEFORE browser paints
  // This prevents the user from seeing any jump/jitter
  useLayoutEffect(() => {
    const currentCount = messages?.length || 0;
    const prevCount = prevMessageCountRef.current;

    // Case 1: Initial mount or first load - INSTANT scroll before paint
    if (isInitialMountRef.current && currentCount > 0) {
      isInitialMountRef.current = false;
      scrollToBottom('auto'); // INSTANT - no animation
      prevMessageCountRef.current = currentCount;
      return;
    }

    // Case 2: New messages added (count increased)
    if (currentCount > prevCount && prevCount > 0) {
      // Only smooth scroll if user was already near bottom
      if (isNearBottomRef.current) {
        scrollToBottom('smooth');
      }
    }

    // Update prev count
    prevMessageCountRef.current = currentCount;
  }, [messages?.length, scrollToBottom]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0 && onMarkAsRead) {
      const normalizedCurrentUserId = String(currentUserId || '').trim();

      if (!normalizedCurrentUserId || normalizedCurrentUserId === 'undefined') {
        return;
      }

      const unreadMessages = messages.filter((msg) => {
        const msgSenderId = String(msg.senderId || msg.sender_id || '').trim();

        if (!msgSenderId || msgSenderId === 'undefined') {
          return false;
        }

        const isNotOwnMessage =
          msgSenderId !== normalizedCurrentUserId &&
          msgSenderId.toLowerCase() !== normalizedCurrentUserId.toLowerCase();

        return isNotOwnMessage && !msg.read;
      });

      if (unreadMessages.length > 0) {
        const senderId = unreadMessages[0].senderId || unreadMessages[0].sender_id;
        const tripId = unreadMessages[0].tripId;
        onMarkAsRead(currentUserId, tripId, senderId);
      }
    }
  }, [messages, currentUserId, onMarkAsRead]);

  // Get the timestamp from various possible field names
  const getTimestamp = (message) => {
    return message.timestamp || message.createdAt || message.created_at || null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';

      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('ar-IQ', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        return date.toLocaleDateString('ar-IQ', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      return '';
    }
  };

  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Check if message can be edited (within 15 minutes)
  const canEditMessage = (message) => {
    if (message.isDeleted) return false;
    const createdAt = new Date(message.createdAt || message.created_at);
    const now = new Date();
    const diffMinutes = (now - createdAt) / (1000 * 60);
    return diffMinutes <= 15; // Can edit within 15 minutes
  };

  // Handle right-click on message
  const handleContextMenu = (e, message, isOwnMessage) => {
    e.preventDefault();
    if (message.isDeleted) return;

    setContextMenu({
      message,
      position: { x: e.clientX, y: e.clientY },
      isOwnMessage,
    });
  };

  // Handle long press start
  const handleTouchStart = (message, isOwnMessage) => {
    if (message.isDeleted) return;

    longPressTimer.current = setTimeout(() => {
      // Vibrate on mobile (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setContextMenu({
        message,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        isOwnMessage,
      });
    }, longPressThreshold);
  };

  // Handle touch end (cancel long press)
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Handle edit action from context menu
  const handleEdit = (message) => {
    setEditingMessage(message);
    setContextMenu(null);
  };

  // Handle save edit
  const handleSaveEdit = async (newContent) => {
    if (!editingMessage) return;

    setIsEditLoading(true);
    try {
      await editMessage(editingMessage.id, newContent);
      setEditingMessage(null);
    } catch (error) {
      console.error('[MessageList] Error editing message:', error);
      // Error handling is done in context - just log here
    } finally {
      setIsEditLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  // Handle delete for me
  const handleDeleteForMe = async (message) => {
    if (!window.confirm('هل تريد حذف هذه الرسالة من جهازك فقط؟')) return;

    try {
      await deleteMessage(message.id, false);
    } catch (error) {
      console.error('[MessageList] Error deleting message for me:', error);
    }
  };

  // Handle delete for everyone
  const handleDeleteForAll = async (message) => {
    if (!window.confirm('هل تريد حذف هذه الرسالة للجميع؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    try {
      await deleteMessage(message.id, true);
    } catch (error) {
      console.error('[MessageList] Error deleting message for everyone:', error);
    }
  };

  // Handle copy
  const handleCopy = () => {
    // Optionally show a toast notification here
    console.log('[MessageList] Message copied to clipboard');
  };

  if (!messages || messages.length === 0) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-secondary)',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-base)',
          fontFamily: '"Cairo", sans-serif',
        }}
      >
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
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'scroll', // Always show scrollbar area
          overflowX: 'hidden',
          overscrollBehaviorY: 'contain', // Prevent rubber-band affecting parent
          WebkitOverflowScrolling: 'touch', // Smooth iOS scrolling
          padding: 'var(--space-4)',
          background: 'var(--surface-secondary)',
          direction: 'rtl',
        }}
      >
        {messages.map((message, index) => {
          const messageSenderId = String(message.senderId || message.sender_id || '').trim();
          const normalizedCurrentUserId = String(currentUserId || '').trim();

          const isValidMessageId = messageSenderId && messageSenderId !== 'undefined';
          const isValidCurrentId =
            normalizedCurrentUserId && normalizedCurrentUserId !== 'undefined';

          const isOwnMessage =
            isValidMessageId &&
            isValidCurrentId &&
            (messageSenderId === normalizedCurrentUserId ||
              messageSenderId.toLowerCase() === normalizedCurrentUserId.toLowerCase());

          const msgTimestamp = getTimestamp(message);
          const prevMsgTimestamp = index > 0 ? getTimestamp(messages[index - 1]) : null;

          let showDate = index === 0;
          if (!showDate && msgTimestamp && prevMsgTimestamp) {
            try {
              const currentDate = new Date(msgTimestamp);
              const prevDate = new Date(prevMsgTimestamp);
              showDate =
                !isNaN(currentDate.getTime()) &&
                !isNaN(prevDate.getTime()) &&
                currentDate.toDateString() !== prevDate.toDateString();
            } catch {
              showDate = false;
            }
          }

          return (
            <div key={message.id || index}>
              {/* Date separator */}
              {showDate && msgTimestamp && (
                <div
                  style={{
                    textAlign: 'center',
                    margin: 'var(--space-4) 0',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {formatDateSeparator(msgTimestamp)}
                </div>
              )}

              {/* Message bubble */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginBottom: 'var(--space-2)',
                  animation: 'fadeInUp 0.3s ease-out',
                }}
              >
                <div
                  onContextMenu={(e) => handleContextMenu(e, message, isOwnMessage)}
                  onTouchStart={() => handleTouchStart(message, isOwnMessage)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  style={{
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
                    position: 'relative',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                >
                  {/* Sender name for received messages */}
                  {!isOwnMessage && (message.senderName || message.sender_name) && (
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: '600',
                        color: 'var(--primary)',
                        marginBottom: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {message.senderName || message.sender_name}
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    style={{
                      fontSize: 'var(--text-base)',
                      lineHeight: '1.5',
                      fontFamily: '"Cairo", sans-serif',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontStyle: message.isDeleted ? 'italic' : 'normal',
                      opacity: message.isDeleted ? 0.6 : 1,
                    }}
                  >
                    {message.isDeleted ? 'تم حذف هذه الرسالة' : message.content}
                  </div>

                  {/* Edited indicator */}
                  {message.isEdited && !message.isDeleted && (
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: isOwnMessage ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-muted)',
                        marginRight: 'var(--space-1)',
                      }}
                    >
                      (معدلة)
                    </span>
                  )}

                  {/* Message timestamp and read status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      marginTop: 'var(--space-1)',
                      fontSize: 'var(--text-xs)',
                      opacity: 0.7,
                      gap: 'var(--space-1)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Cairo", sans-serif',
                        color: isOwnMessage ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)',
                      }}
                    >
                      {formatTime(msgTimestamp)}
                    </span>

                    {/* Message status indicators for own messages */}
                    {isOwnMessage && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        {message.isOptimistic && (
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px' }}>
                            ⏳
                          </span>
                        )}
                        {message.isFailed && (
                          <span style={{ color: '#ef4444', fontSize: '10px' }}>❌</span>
                        )}
                        {!message.isOptimistic &&
                          !message.isFailed &&
                          message.status === 'sent' && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>✓</span>
                          )}
                        {message.status === 'delivered' && (
                          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>✓✓</span>
                        )}
                        {message.status === 'read' && <span style={{ color: '#4ade80' }}>✓✓</span>}
                      </div>
                    )}

                    {/* Read indicator for received messages */}
                    {!isOwnMessage && message.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          background: 'var(--primary)',
                          borderRadius: '50%',
                          marginRight: 'var(--space-1)',
                        }}
                      />
                    )}
                  </div>

                  {/* Unread indicator for received messages */}
                  {!isOwnMessage && !message.read && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '8px',
                        height: '8px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        border: '2px solid white',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          message={contextMenu.message}
          isOwnMessage={contextMenu.isOwnMessage}
          canEdit={contextMenu.isOwnMessage && canEditMessage(contextMenu.message)}
          position={contextMenu.position}
          onEdit={handleEdit}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForAll={handleDeleteForAll}
          onCopy={handleCopy}
          onClose={handleCloseContextMenu}
        />
      )}

      {/* Edit Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isLoading={isEditLoading}
        />
      )}
    </>
  );
};

export default MessageList;
