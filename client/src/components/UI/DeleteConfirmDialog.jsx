import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Confirmation dialog for destructive actions (delete message/conversation)
 */
const DeleteConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'حذف',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  isLoading,
  variant = 'danger', // 'danger' or 'warning'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: '#dc2626',
      button: '#dc2626',
      buttonHover: '#b91c1c',
    },
    warning: {
      icon: '#f59e0b',
      button: '#f59e0b',
      buttonHover: '#d97706',
    },
  };

  const theme = colors[variant] || colors.danger;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={onCancel}
      >
        {/* Dialog */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '340px',
            direction: 'rtl',
            animation: 'scaleIn 0.2s ease-out',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon and Content */}
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: `${theme.icon}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} color={theme.icon} />
            </div>
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRight: '1px solid #e5e7eb',
                background: 'white',
                fontSize: '14px',
                fontWeight: 500,
                color: '#6b7280',
                cursor: 'pointer',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                background: 'white',
                fontSize: '14px',
                fontWeight: 600,
                color: theme.button,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${theme.button}40`,
                    borderTopColor: theme.button,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default DeleteConfirmDialog;
