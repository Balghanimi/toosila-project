import React from 'react';

/**
 * Button Component
 * Unified, accessible button component with consistent styling
 *
 * Features:
 * - Multiple variants (primary, secondary, success, danger, warning, ghost)
 * - Multiple sizes (sm, md, lg)
 * - Loading state with spinner
 * - Icon support (left/right)
 * - Full accessibility (ARIA attributes)
 * - Consistent hover/active states
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...props
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      hoverTransform: 'translateY(-2px)',
      hoverShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
    },
    secondary: {
      background: 'white',
      color: 'var(--primary, #3b82f6)',
      border: '2px solid var(--primary, #3b82f6)',
      hoverBackground: 'var(--primary, #3b82f6)',
      hoverColor: 'white',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      hoverTransform: 'translateY(-2px)',
      hoverShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      hoverTransform: 'translateY(-2px)',
      hoverShadow: '0 10px 20px rgba(239, 68, 68, 0.3)',
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      border: 'none',
      hoverTransform: 'translateY(-2px)',
      hoverShadow: '0 10px 20px rgba(245, 158, 11, 0.3)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: 'none',
      hoverBackground: 'var(--surface-secondary)',
    },
  };

  const sizes = {
    sm: {
      padding: 'var(--space-2) var(--space-3)',
      fontSize: 'var(--text-sm)',
      minHeight: '36px',
    },
    md: {
      padding: 'var(--space-3) var(--space-5)',
      fontSize: 'var(--text-base)',
      minHeight: '44px',
    },
    lg: {
      padding: 'var(--space-4) var(--space-6)',
      fontSize: 'var(--text-lg)',
      minHeight: '52px',
    },
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: '"Cairo", sans-serif',
    fontWeight: '600',
    borderRadius: 'var(--radius-lg)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    ...variantStyle,
    ...sizeStyle,
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const dynamicStyle = {
    ...baseStyle,
    ...(isHovered &&
      !disabled &&
      !loading && {
        transform: variantStyle.hoverTransform || 'none',
        boxShadow: variantStyle.hoverShadow || 'none',
        background: variantStyle.hoverBackground || variantStyle.background,
        color: variantStyle.hoverColor || variantStyle.color,
      }),
    ...(isActive &&
      !disabled &&
      !loading && {
        transform: 'scale(0.98)',
      }),
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      aria-label={ariaLabel}
      aria-busy={loading}
      style={dynamicStyle}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
          aria-hidden="true"
        />
      )}

      {/* Left Icon */}
      {icon && iconPosition === 'left' && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Button Text */}
      {children && <span>{children}</span>}

      {/* Right Icon */}
      {icon && iconPosition === 'right' && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Keyframes for spinner */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
};

/**
 * Button Group Component
 * Groups multiple buttons with consistent spacing
 */
export const ButtonGroup = ({ children, spacing = 'var(--space-3)', align = 'left' }) => {
  const alignments = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: spacing,
        flexWrap: 'wrap',
        justifyContent: alignments[align] || alignments.left,
      }}
    >
      {children}
    </div>
  );
};

export default Button;
