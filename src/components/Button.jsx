import React from 'react';
import './Button.css';

/**
 * Sprint 12 Component-Driven Architecture: Isolated Button Component
 * Supports strict prop matrix variations: primary, secondary, disabled, loading, and sizes.
 */
export const Button = ({
  primary = false,
  secondary = false,
  disabled = false,
  loading = false,
  size = 'medium',
  label = 'Button',
  onClick,
  ...props
}) => {
  const modeClass = primary ? 'btn-primary' : secondary ? 'btn-secondary' : 'btn-default';
  const sizeClass = `btn-${size}`;

  return (
    <button
      type="button"
      className={['btn', sizeClass, modeClass, loading ? 'btn-loading' : ''].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner-wrapper">
          <span className="btn-spinner" aria-hidden="true" />
          <span>Processing...</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
};
