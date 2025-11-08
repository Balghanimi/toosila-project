import React from 'react';

/**
 * Professional Input Component
 * Supports validation states, sizes, and error handling
 */
const Input = ({
  label,
  error,
  success,
  helperText,
  size = 'md',
  type = 'text',
  className = '',
  containerClassName = '',
  icon,
  addon,
  ...props
}) => {
  const inputClass = 'input-pro';
  const sizeClass = size !== 'md' ? `input-pro-${size}` : '';
  const stateClass = error ? 'input-pro-error' : success ? 'input-pro-success' : '';

  const inputClasses = [
    inputClass,
    sizeClass,
    stateClass,
    className
  ].filter(Boolean).join(' ');

  const renderInput = () => (
    <input
      type={type}
      className={inputClasses}
      {...props}
    />
  );

  return (
    <div className={`input-wrapper ${containerClassName}`}>
      {label && (
        <label className="input-label" style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          {label}
        </label>
      )}

      {addon ? (
        <div className="input-group-pro">
          {renderInput()}
          <span className="input-addon">{addon}</span>
        </div>
      ) : (
        renderInput()
      )}

      {(error || helperText) && (
        <div style={{
          marginTop: '6px',
          fontSize: '13px',
          color: error ? 'var(--error)' : 'var(--text-muted)'
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
