import React, { useEffect, useRef } from 'react';

/**
 * ConfirmDialog Component
 * Accessible confirmation dialog for important user actions
 * Especially useful for destructive actions (delete, cancel, etc.)
 *
 * Features:
 * - Focus trapping
 * - Keyboard navigation (Enter confirms, Escape cancels)
 * - Accessible ARIA attributes
 * - Mobile-optimized (bottom sheet on small screens)
 * - Customizable variants (danger, warning, info)
 */
const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'هل أنت متأكد؟',
  message = '',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger', // 'danger', 'warning', 'info'
  icon,
  loading = false,
}) => {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Focus cancel button by default (safer for destructive actions)
      cancelButtonRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Enter' && !loading) {
          onConfirm();
        } else if (e.key === 'Tab') {
          // Simple focus trap - keep focus within dialog
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftTab && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, onConfirm, loading]);

  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: icon || '⚠️',
      iconBackground: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      iconColor: '#dc2626',
      confirmButton: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      border: '#fecaca',
    },
    warning: {
      icon: icon || '⚠️',
      iconBackground: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      iconColor: '#d97706',
      confirmButton: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      border: '#fde68a',
    },
    info: {
      icon: icon || 'ℹ️',
      iconBackground: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      iconColor: '#2563eb',
      confirmButton: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      border: '#bfdbfe',
    },
  };

  const config = variants[variant] || variants.danger;

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
          background: 'var(--surface-overlay)',
          backdropFilter: 'blur(4px)',
          zIndex: 'var(--z-modal-backdrop, 1040)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 'var(--z-modal, 1050)',
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          maxWidth: '420px',
          width: 'calc(100vw - 2 * var(--space-4))',
          boxShadow: 'var(--shadow-2xl)',
          fontFamily: '"Cairo", sans-serif',
          animation: 'dialogEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: config.iconBackground,
            border: `2px solid ${config.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: config.iconColor,
            margin: '0 auto var(--space-4)',
          }}
          aria-hidden="true"
        >
          {config.icon}
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 'var(--space-2)',
            margin: '0 0 var(--space-2) 0',
          }}
        >
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p
            id="confirm-dialog-description"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: 'var(--space-6)',
              margin: '0 0 var(--space-6) 0',
            }}
          >
            {message}
          </p>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
          }}
        >
          {/* Cancel Button */}
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            disabled={loading}
            style={{
              padding: 'var(--space-3)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Cairo", sans-serif',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.background = 'var(--surface-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.background = 'var(--surface-secondary)';
              }
            }}
          >
            {cancelText}
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: 'var(--space-3)',
              background: loading ? '#9ca3af' : config.confirmButton,
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Cairo", sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                  aria-hidden="true"
                />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes dialogEnter {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes dialogEnter {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }

        /* Mobile bottom sheet */
        @media (max-width: 640px) {
          [role="alertdialog"] {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            border-radius: var(--radius-2xl) var(--radius-2xl) 0 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </>
  );
};

export default ConfirmDialog;
