import React from 'react';

/**
 * Phase 3: Empty State Illustration & Message
 */
export const EmptyState = () => {
  return (
    <div className="empty-state-container" role="status" aria-label="No messages in live feed">
      <div className="empty-state-icon" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
          <line x1="12" y1="7" x2="12" y2="13" />
        </svg>
      </div>
      <h3 className="empty-state-title">Live Dispatch Feed Empty</h3>
      <p className="empty-state-desc">
        Awaiting incoming floor telemetry and dispatch signals. Send a message below or trigger an echo test payload.
      </p>
    </div>
  );
};
