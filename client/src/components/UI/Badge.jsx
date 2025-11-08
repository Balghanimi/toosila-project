import React from 'react';

/**
 * Professional Badge Component
 * For status indicators, labels, and counters
 */
const Badge = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  ...props
}) => {
  const baseClass = 'badge-pro';
  const variantClass = `badge-pro-${variant}`;
  const dotClass = dot ? 'badge-pro-dot' : '';

  const classes = [
    baseClass,
    variantClass,
    dotClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
