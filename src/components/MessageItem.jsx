import React from 'react';
import { sanitizeText } from '../utils/sanitize';

/**
 * Message Item bubble component
 */
export const MessageItem = ({ message }) => {
  const isSelf = message.sender === 'user';
  const sanitizedContent = sanitizeText(message.text);

  return (
    <article
      className={`message-bubble-wrapper ${isSelf ? 'bubble-self' : 'bubble-remote'}`}
      aria-label={`${isSelf ? 'Dispatched message' : 'Incoming stream message'} at ${message.timestamp}`}
    >
      <div className="message-bubble">
        <header className="message-header">
          <span className="message-sender-tag">
            {isSelf ? '📤 Dispatch Desk (You)' : '📥 Floor Staff / Echo Stream'}
          </span>
          <time className="message-time" dateTime={message.rawDate}>
            {message.timestamp}
          </time>
        </header>
        <p className="message-body">{sanitizedContent}</p>
        {message.latencyMs !== undefined && (
          <footer className="message-footer">
            <span className="latency-tag">⚡ Latency: {message.latencyMs}ms</span>
          </footer>
        )}
      </div>
    </article>
  );
};
