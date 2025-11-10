import React from 'react';

/**
 * Professional Button Component
 * Supports multiple variants, sizes, and states
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'start',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClass = 'btn-pro';
  const variantClass = `btn-pro-${variant}`;
  const sizeClass = size !== 'md' ? `btn-pro-${size}` : '';
  const loadingClass = loading ? 'btn-pro-loading' : '';
  const fullWidthClass = fullWidth ? 'w-full' : '';

  const classes = [baseClass, variantClass, sizeClass, loadingClass, fullWidthClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {icon && iconPosition === 'start' && <span className="btn-icon">{icon}</span>}
      {children}
      {icon && iconPosition === 'end' && <span className="btn-icon">{icon}</span>}
    </button>
  );
};

export default Button;
