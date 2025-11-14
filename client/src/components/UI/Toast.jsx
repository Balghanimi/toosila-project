import React, { useEffect, useState } from 'react';

/**
 * Toast Notification Component
 * Professional toast notifications with auto-dismiss, manual dismiss, and animations
 * Accessible and supports multiple variants
 */
const Toast = ({
  variant = 'info',
  message = '',
  description = '',
  duration = 5000,
  position = 'top-right',
  onClose,
  icon,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const variants = {
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: '✓',
      borderColor: '#059669',
    },
    error: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: '✕',
      borderColor: '#dc2626',
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: '⚠',
      borderColor: '#d97706',
    },
    info: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      icon: 'ℹ',
      borderColor: '#2563eb',
    },
  };

  const positions = {
    'top-right': {
      top: '80px',
      right: 'var(--space-4)',
      left: 'auto',
    },
    'top-left': {
      top: '80px',
      left: 'var(--space-4)',
      right: 'auto',
    },
    'bottom-right': {
      bottom: 'var(--space-4)',
      right: 'var(--space-4)',
      left: 'auto',
    },
    'bottom-left': {
      bottom: 'var(--space-4)',
      left: 'var(--space-4)',
      right: 'auto',
    },
    'top-center': {
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  };

  const config = variants[variant] || variants.info;
  const positionStyle = positions[position] || positions['top-right'];

  return (
    <>
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          ...positionStyle,
          zIndex: 'var(--z-notification, 1080)',
          minWidth: '320px',
          maxWidth: '480px',
          background: config.background,
          color: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          fontFamily: '"Cairo", sans-serif',
          animation: isExiting ? 'toast-exit 0.3s ease-out' : 'toast-enter 0.3s ease-out',
          border: `2px solid ${config.borderColor}`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: '1.5rem',
            lineHeight: '1',
            flexShrink: 0,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius)',
          }}
          aria-hidden="true"
        >
          {icon || config.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {message && (
            <div
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                marginBottom: description ? 'var(--space-1)' : 0,
                lineHeight: '1.4',
              }}
            >
              {message}
            </div>
          )}
          {description && (
            <div
              style={{
                fontSize: 'var(--text-sm)',
                opacity: 0.9,
                lineHeight: '1.4',
              }}
            >
              {description}
            </div>
          )}
          {action && (
            <button
              onClick={action.onClick}
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-3)',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="إغلاق الإشعار"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            lineHeight: '1',
            flexShrink: 0,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius)',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          ✕
        </button>

        {/* Progress bar (optional visual indicator) */}
        {duration > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'white',
                animation: `progress ${duration}ms linear`,
                transformOrigin: 'left',
              }}
            />
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }

        @keyframes progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes toast-enter,
          @keyframes toast-exit {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          [role="alert"] {
            min-width: calc(100vw - 2 * var(--space-4)) !important;
            max-width: calc(100vw - 2 * var(--space-4)) !important;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Toast Container Component
 * Manages multiple toasts in a stack
 */
export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id || index}
          style={{
            marginBottom: index < toasts.length - 1 ? 'var(--space-2)' : 0,
          }}
        >
          <Toast {...toast} onClose={() => onRemove && onRemove(toast.id || index)} />
        </div>
      ))}
    </>
  );
};

export default Toast;
