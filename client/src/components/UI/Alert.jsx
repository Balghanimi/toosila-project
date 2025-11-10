import React from 'react';

/**
 * Professional Alert Component
 * For displaying important messages and notifications
 */
const Alert = ({ children, variant = 'info', icon, onClose, className = '', ...props }) => {
  const baseClass = 'alert-pro';
  const variantClass = `alert-pro-${variant}`;

  const classes = [baseClass, variantClass, className].filter(Boolean).join(' ');

  const defaultIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={classes} role="alert" {...props}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        {(icon || defaultIcons[variant]) && (
          <span style={{ fontSize: '20px', lineHeight: '1' }}>{icon || defaultIcons[variant]}</span>
        )}
        <div style={{ flex: 1 }}>{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1',
              opacity: '0.6',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.opacity = '1')}
            onMouseOut={(e) => (e.target.style.opacity = '0.6')}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
