import React from 'react';

/**
 * EmptyState Component
 * Consistent, friendly empty state with icon, message, and actions
 * Provides clear guidance to users when lists or content are empty
 */
const EmptyState = ({
  icon = '📭',
  title = 'لا توجد عناصر',
  description = '',
  actions = [],
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const sizes = {
    sm: {
      container: 'var(--space-6)',
      icon: '3rem',
      titleSize: 'var(--text-base)',
      descSize: 'var(--text-sm)',
    },
    md: {
      container: 'var(--space-8)',
      icon: '4rem',
      titleSize: 'var(--text-xl)',
      descSize: 'var(--text-base)',
    },
    lg: {
      container: 'var(--space-12)',
      icon: '5rem',
      titleSize: 'var(--text-2xl)',
      descSize: 'var(--text-lg)',
    },
  };

  const sizeConfig = sizes[size] || sizes.md;

  const variants = {
    default: {
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-light)',
      shadow: 'var(--shadow-md)',
    },
    subtle: {
      background: 'transparent',
      border: 'none',
      shadow: 'none',
    },
    card: {
      background: 'var(--surface-primary)',
      border: '2px solid var(--border-light)',
      shadow: 'var(--shadow-lg)',
    },
  };

  const variantConfig = variants[variant] || variants.default;

  return (
    <div
      className={className}
      style={{
        textAlign: 'center',
        padding: sizeConfig.container,
        background: variantConfig.background,
        border: variantConfig.border,
        borderRadius: 'var(--radius-xl)',
        boxShadow: variantConfig.shadow,
        fontFamily: '"Cairo", sans-serif',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Icon/Emoji */}
      <div
        style={{
          fontSize: sizeConfig.icon,
          marginBottom: 'var(--space-4)',
          animation: 'fadeIn 0.5s ease-out',
        }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: sizeConfig.titleSize,
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: description ? 'var(--space-2)' : 'var(--space-4)',
          margin: '0 0 ' + (description ? 'var(--space-2)' : 'var(--space-4)') + ' 0',
        }}
      >
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: sizeConfig.descSize,
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-4)',
            margin: '0 0 var(--space-4) 0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6',
          }}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 'var(--space-4)',
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={
                action.variant === 'primary'
                  ? 'btn-pro btn-pro-primary'
                  : 'btn-pro btn-pro-secondary'
              }
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background:
                  action.variant === 'primary'
                    ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                    : 'var(--surface-secondary)',
                color: action.variant === 'primary' ? 'white' : 'var(--text-primary)',
                border: action.variant === 'primary' ? 'none' : '2px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: action.variant === 'primary' ? 'var(--shadow-md)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (action.variant === 'primary') {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-lg)';
                } else {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (action.variant === 'primary') {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                } else {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.color = 'var(--text-primary)';
                }
              }}
              aria-label={action.ariaLabel || action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
