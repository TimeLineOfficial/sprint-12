import React from 'react';

/**
 * Phase 3: Unhappy Path - Connection Dropped & Exponential Backoff Banner
 */
export const ConnectionBanner = ({
  status,
  retryAttempt,
  nextRetryDelayMs,
  onManualReconnect,
}) => {
  if (status === 'CONNECTED') return null;

  const isConnecting = status === 'CONNECTING';

  return (
    <div
      className={`connection-banner ${isConnecting ? 'banner-connecting' : 'banner-disconnected'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="banner-content">
        <span className="banner-dot" aria-hidden="true" />
        <span className="banner-text">
          {isConnecting ? (
            <>
              <strong>Connecting to WebSocket stream...</strong> (3G Latency Simulation Active)
            </>
          ) : (
            <>
              <strong>Connection Lost.</strong> Attempting to reconnect in{' '}
              <span className="banner-delay">{Math.round(nextRetryDelayMs / 1000)}s</span>{' '}
              (Attempt #{retryAttempt}, Exponential Backoff capped at 10s)...
            </>
          )}
        </span>
      </div>
      {!isConnecting && (
        <button
          type="button"
          className="banner-retry-btn"
          onClick={onManualReconnect}
          aria-label="Force immediate WebSocket reconnection"
        >
          Reconnect Now
        </button>
      )}
    </div>
  );
};
