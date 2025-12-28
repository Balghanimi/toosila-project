import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = 'اكتب رسالتك هنا...',
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Validate message content
  const validateMessage = (content) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return 'الرسالة لا يمكن أن تكون فارغة';
    }

    if (trimmedContent.length < 2) {
      return 'الرسالة قصيرة جداً';
    }

    if (trimmedContent.length > maxLength) {
      return `الرسالة طويلة جداً (الحد الأقصى ${maxLength} حرف)`;
    }

    // Check for spam patterns
    const repeatedChars = /(.)\1{10,}/.test(trimmedContent);
    if (repeatedChars) {
      return 'الرسالة تحتوي على تكرار مفرط';
    }

    // Check for excessive whitespace
    const excessiveWhitespace = /\s{5,}/.test(trimmedContent);
    if (excessiveWhitespace) {
      return 'الرسالة تحتوي على مسافات مفرطة';
    }

    return null; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (disabled || isSending) return;

    const validationError = validateMessage(message);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsSending(true);
    setError('');

    try {
      await onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      setCharCount(0);
    } catch (err) {
      setError('فشل في إرسال الرسالة. حاول مرة أخرى.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    // Limit character count
    if (value.length > maxLength) {
      return; // Don't update if exceeding limit
    }

    setMessage(value);
    setCharCount(value.length);
    setError(''); // Clear any previous errors

    // Typing indicator logic
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
    }
  };

  const handleFocus = () => {
    if (textareaRef.current) {
      // Scroll to bottom when focusing
      setTimeout(() => {
        textareaRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        direction: 'rtl',
        // iPhone safe area support
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Typing indicator - positioned above input */}
      {isTyping && (
        <div
          style={{
            background: 'var(--surface-secondary)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontFamily: '"Cairo", sans-serif',
            animation: 'fadeInUp 0.3s ease-out',
            alignSelf: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span>يكتب</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                }}
              />
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.2s',
                }}
              />
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.4s',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Message input */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              width: '100%',
              minHeight: '40px',
              maxHeight: '120px',
              padding: 'var(--space-3)',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              color: 'var(--text-primary)',
              resize: 'none',
              direction: 'rtl',
              textAlign: 'right',
              lineHeight: '1.5',
              borderRadius: 'var(--radius)',
              transition: 'var(--transition)',
            }}
          />

          {/* Character count */}
          {charCount > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '8px',
                fontSize: 'var(--text-xs)',
                color:
                  charCount > maxLength * 0.8
                    ? 'var(--warning)'
                    : charCount > maxLength * 0.9
                      ? 'var(--error)'
                      : 'var(--text-muted)',
                fontFamily: '"Cairo", sans-serif',
                fontWeight: '500',
              }}
            >
              {charCount}/{maxLength}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '0',
                background: 'var(--error)',
                color: 'white',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                fontFamily: '"Cairo", sans-serif',
                fontWeight: '500',
                boxShadow: 'var(--shadow-md)',
                animation: 'slideDown 0.3s ease-out',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled || isSending}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            background:
              message.trim() && !disabled && !isSending
                ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                : 'var(--text-muted)',
            color: 'white',
            cursor: message.trim() && !disabled && !isSending ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            transition: 'var(--transition)',
            boxShadow: message.trim() && !disabled ? 'var(--shadow-md)' : 'none',
            opacity: message.trim() && !disabled ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }
          }}
          onMouseDown={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.transform = 'scale(1.05)';
            }
          }}
        >
          {isSending ? (
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : disabled ? (
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: 'rotate(-45deg)' }}
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </form>
  );
};

export default MessageInput;
