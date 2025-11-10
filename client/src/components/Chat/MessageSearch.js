import React, { useState, useEffect } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';

const MessageSearch = ({ onSelectMessage, onClose }) => {
  const { searchMessages, searchConversations } = useMessages();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('messages'); // 'messages' or 'conversations'

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      if (searchType === 'messages') {
        const results = searchMessages(user?.id, searchTerm);
        setSearchResults(results);
      } else {
        const results = searchConversations(user?.id, searchTerm);
        setSearchResults(results);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType, user?.id, searchMessages, searchConversations]);

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

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          style={{
            background: 'var(--warning)',
            color: 'var(--text-primary)',
            padding: '2px 4px',
            borderRadius: 'var(--radius)',
            fontWeight: '600',
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleSelectResult = (result) => {
    if (searchType === 'messages') {
      onSelectMessage(result);
    } else {
      onSelectMessage(result);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
            🔍 البحث في الرسائل
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: 'var(--text-lg)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Controls */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {/* Search Type Toggle */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <button
              onClick={() => setSearchType('messages')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                background:
                  searchType === 'messages' ? 'var(--primary)' : 'var(--surface-secondary)',
                color: searchType === 'messages' ? 'white' : 'var(--text-secondary)',
              }}
            >
              💬 الرسائل
            </button>
            <button
              onClick={() => setSearchType('conversations')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                background:
                  searchType === 'conversations' ? 'var(--primary)' : 'var(--surface-secondary)',
                color: searchType === 'conversations' ? 'white' : 'var(--text-secondary)',
              }}
            >
              👥 المحادثات
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={`البحث في ${searchType === 'messages' ? 'الرسائل' : 'المحادثات'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontFamily: '"Cairo", sans-serif',
                background: 'var(--surface-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                direction: 'rtl',
                transition: 'var(--transition)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(52, 199, 89, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 'var(--text-lg)',
                color: isSearching ? 'var(--primary)' : 'var(--text-muted)',
                animation: isSearching ? 'spin 1s linear infinite' : 'none',
              }}
            >
              {isSearching ? '⟳' : '🔍'}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: 'var(--space-2)',
          }}
        >
          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🔍</div>
              <div>لم يتم العثور على نتائج</div>
              <div style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                جرب مصطلحات بحث مختلفة
              </div>
            </div>
          )}

          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleSelectResult(result)}
              style={{
                padding: 'var(--space-3)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-2)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                background: 'var(--surface-primary)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--surface-secondary)';
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--surface-primary)';
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {searchType === 'messages' ? (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {result.otherUserId}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {formatTime(result.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif',
                      lineHeight: '1.4',
                    }}
                  >
                    {highlightText(result.content, searchTerm)}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {highlightText(result.otherUserName, searchTerm)}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {formatTime(result.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif',
                      lineHeight: '1.4',
                    }}
                  >
                    {highlightText(result.lastMessage.content, searchTerm)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes spin {
            from { transform: translateY(-50%) rotate(0deg); }
            to { transform: translateY(-50%) rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default MessageSearch;
