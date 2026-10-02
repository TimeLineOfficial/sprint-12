import React from 'react';
import './Badge.css';

/**
 * Sprint 12 Isolated Status Badge Component
 */
export const Badge = ({ status = 'online', text, pulse = true }) => {
  const badgeText = text || status.toUpperCase();
  return (
    <span className={`status-badge badge-${status}`}>
      {pulse && <span className="badge-pulse-dot" aria-hidden="true" />}
      <span>{badgeText}</span>
    </span>
  );
};
