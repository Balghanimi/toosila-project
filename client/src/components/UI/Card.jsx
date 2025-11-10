import React from 'react';

/**
 * Professional Card Component
 * Supports multiple variants and interactive states
 */
const Card = ({
  children,
  variant = 'default',
  interactive = false,
  accent = false,
  hover = true,
  className = '',
  onClick,
  ...props
}) => {
  const baseClass = 'card-pro';
  const variantClass = variant !== 'default' ? `card-pro-${variant}` : '';
  const interactiveClass = interactive ? 'card-pro-interactive' : '';
  const accentClass = accent ? 'card-pro-accent' : '';
  const hoverClass = hover ? 'hover-lift' : '';

  const classes = [baseClass, variantClass, interactiveClass, accentClass, hoverClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
