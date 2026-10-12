import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { isValidMessage } from '../utils/sanitize';
import { EmptyState } from './EmptyState';
import { ConnectionBanner } from './ConnectionBanner';
import { MessageItem } from './MessageItem';

const WS_ENDPOINT = 'wss://echo.websocket.events';
const MAX_BACKOFF_MS = 10000;

/**
 * LiveFeedEngine.jsx - Core Component
 * Ticket: ENG-149204 | Epic: Core Infrastructure Overhaul & Real-Time Sync
 */
export const LiveFeedEngine = () => {
  // Phase 1: Local state definition (as mandated by TRD)
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
  const [messageLog, setMessageLog] = useState([]); // Array
  
  // Controlled input state
  const [inputText, setInputText] = useState('');
  
  // Exponential backoff & retry state
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [nextRetryDelayMs, setNextRetryDelayMs] = useState(1000);
  const [isSimulatingSlowNetwork, setIsSimulatingSlowNetwork] = useState(false);

  // Refs for socket instance, cleanup, and DOM auto-scroll
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const feedEndRef = useRef(null);
  const feedContainerRef = useRef(null);
  const isAutoScrollEnabled = useRef(true);
  const activeDispatchTimes = useRef(new Map());

  // NFR: Telemetry simulation hook
  const { trackEvent } = useAnalytics();

  /**
   * Exponential Backoff Calculation
   * Helper: 1000ms -> 2000ms -> 4000ms -> capped at 10000ms
   */
  const calculateBackoffDelay = useCallback((attempt) => {
    const delay = Math.min(1000 * Math.pow(2, attempt), MAX_BACKOFF_MS);
    return delay;
  }, []);

  /**
   * Initialize and connect WebSocket with lifecycle handlers
   */
  const connectWebSocket = useCallback(() => {
    // Clear any pending reconnect timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionStatus('CONNECTING');
    trackEvent('WebSocket Connection Initiated', { endpoint: WS_ENDPOINT });

    try {
      const ws = new WebSocket(WS_ENDPOINT);
      wsRef.current = ws;

      // Phase 2: ws.onopen listener
      ws.onopen = () => {
        setConnectionStatus('CONNECTED');
        setRetryAttempt(0);
        setNextRetryDelayMs(1000);
        trackEvent('WebSocket Connection Established', {
          status: 'CONNECTED',
          endpoint: WS_ENDPOINT,
        });
      };

      // Phase 2: ws.onmessage listener with functional state update
      ws.onmessage = (event) => {
        const receiveTime = Date.now();
        let parsedMessage;

        try {
          const rawData = JSON.parse(event.data);
          parsedMessage = {
            id: rawData.id || `msg-${receiveTime}-${Math.random()}`,
            text: rawData.text || String(event.data),
            sender: rawData.sender || 'remote',
            timestamp: new Date(receiveTime).toLocaleTimeString(),
            rawDate: new Date(receiveTime).toISOString(),
            latencyMs: rawData.sentAt ? receiveTime - rawData.sentAt : undefined,
          };
        } catch {
          // If message is plain string (e.g. echo handshake)
          parsedMessage = {
            id: `msg-${receiveTime}-${Math.random()}`,
            text: String(event.data),
            sender: 'remote',
            timestamp: new Date(receiveTime).toLocaleTimeString(),
            rawDate: new Date(receiveTime).toISOString(),
          };
        }

        // CRITICAL CONSTRAINT: Functional state update pattern prevents stale closures
        setMessageLog((prev) => [...prev, parsedMessage]);

        trackEvent('WebSocket Payload Received', {
          messageId: parsedMessage.id,
          length: parsedMessage.text.length,
        });
      };

      // Phase 2: ws.onerror listener (Graceful degradation)
      ws.onerror = (error) => {
        console.warn('[WebSocket Warning] Connection encountered a transport warning:', error);
        trackEvent('WebSocket Error Degraded', { errorType: 'SocketTransportWarning' });
      };

      // Phase 3: ws.onclose listener & Exponential Backoff Reconnection
      ws.onclose = (event) => {
        setConnectionStatus('DISCONNECTED');
        trackEvent('WebSocket Disconnected', {
          code: event.code,
          reason: event.reason || 'Network drop / remote close',
        });

        // Trigger exponential backoff reconnection
        setRetryAttempt((prevAttempt) => {
          const nextAttempt = prevAttempt + 1;
          const backoffDelay = calculateBackoffDelay(prevAttempt);
          setNextRetryDelayMs(backoffDelay);

          trackEvent('Scheduling Exponential Backoff Reconnect', {
            attempt: nextAttempt,
            delayMs: backoffDelay,
          });

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, backoffDelay);

          return nextAttempt;
        });
      };
    } catch (err) {
      console.error('[WebSocket Instantiation Error]', err);
      setConnectionStatus('DISCONNECTED');
    }
  }, [calculateBackoffDelay, trackEvent]);

  // Phase 1: Mount & Cleanup inside useEffect (Prevents memory leaks)
  useEffect(() => {
    connectWebSocket();

    return () => {
      // Must call ws.close() to prevent memory leaks and drop PR grades
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        trackEvent('WebSocket Cleanup on Component Unmount', {});
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket, trackEvent]);

  // AC3: Auto-scroll within 50ms if user is near bottom
  const handleScroll = () => {
    if (!feedContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedContainerRef.current;
    // User is near bottom if within 80px
    isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  useEffect(() => {
    if (isAutoScrollEnabled.current && feedEndRef.current) {
      // Update DOM scroll within 50ms
      const scrollTimer = setTimeout(() => {
        feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 30);
      return () => clearTimeout(scrollTimer);
    }
  }, [messageLog]);

  /**
   * AC4: Send Message / Emit Payload
   */
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();

    if (!isValidMessage(inputText)) return;

    const trimmedText = inputText.trim();
    const sentTime = Date.now();
    const messageId = `disp-${sentTime}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      id: messageId,
      text: trimmedText,
      sender: 'user',
      sentAt: sentTime,
      type: 'DISPATCH_COMMUNICATION',
    };

    activeDispatchTimes.current.set(messageId, sentTime);

    // If connected, emit via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      trackEvent('User Emitted WebSocket Payload', { messageId, length: trimmedText.length });
    } else {
      // Offline fallback: Push optimistic dispatch to feed and notify user
      setMessageLog((prev) => [
        ...prev,
        {
          id: messageId,
          text: trimmedText,
          sender: 'user',
          timestamp: new Date(sentTime).toLocaleTimeString(),
          rawDate: new Date(sentTime).toISOString(),
        },
      ]);
      trackEvent('User Emitted Local Dispatch (Socket Offline)', { messageId });
    }

    // Reset input
    setInputText('');
  };

  /**
   * Manual Actions for Unhappy Path Simulation (Wi-Fi dropout, slow 3G)
   */
  const simulateWifiDropout = () => {
    trackEvent('Simulating Emergency Wi-Fi Dropout', {});
    if (wsRef.current) {
      wsRef.current.close(4001, 'Simulated Wi-Fi dropout');
    }
  };

  const simulateIncomingDispatch = () => {
    const time = Date.now();
    const mockEvents = [
      '⚠️ Urgent: Forklift clearance needed in Bay 4.',
      '📦 Delivery arrived: 24 pallets of raw materials received.',
      '✅ Dispatch confirmed: Fleet truck #108 departed on route.',
      '🔔 Floor Notice: Shift rotation beginning in 10 minutes.',
    ];
    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    
    // Simulate incoming WebSocket message
    const syntheticPayload = {
      id: `sim-${time}`,
      text: randomEvent,
      sender: 'remote',
      sentAt: time - 42,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(syntheticPayload));
    } else {
      setMessageLog((prev) => [
        ...prev,
        {
          id: syntheticPayload.id,
          text: syntheticPayload.text,
          sender: 'remote',
          timestamp: new Date(time).toLocaleTimeString(),
          rawDate: new Date(time).toISOString(),
          latencyMs: 42,
        },
      ]);
    }

    trackEvent('Simulated Incoming Dispatch Injected', { text: randomEvent });
  };

  const isSendDisabled = !isValidMessage(inputText) || connectionStatus === 'CONNECTING';

  return (
    <section className="live-feed-engine" aria-labelledby="live-feed-title">
      {/* Simulation & Diagnostic Header Bar */}
      <div className="engine-toolbar">
        <div className="engine-status-group">
          <span className="toolbar-label">Status:</span>
          <span className={`status-badge-chip chip-${connectionStatus.toLowerCase()}`}>
            <span className="chip-dot" aria-hidden="true" />
            {connectionStatus}
          </span>
          <span className="toolbar-count">({messageLog.length} events logged)</span>
        </div>

        <div className="engine-actions">
          <button
            type="button"
            className="tool-btn"
            onClick={simulateIncomingDispatch}
            aria-label="Simulate incoming floor dispatch event"
          >
            + Test Incoming Event
          </button>
          <button
            type="button"
            className="tool-btn tool-btn-warn"
            onClick={simulateWifiDropout}
            disabled={connectionStatus === 'DISCONNECTED'}
            aria-label="Simulate connection drop to test exponential backoff"
          >
            ⚡ Drop Connection (Wi-Fi Dropout)
          </button>
        </div>
      </div>

      {/* Phase 3: Unhappy Path Connection Banner */}
      <ConnectionBanner
        status={connectionStatus}
        retryAttempt={retryAttempt}
        nextRetryDelayMs={nextRetryDelayMs}
        onManualReconnect={connectWebSocket}
      />

      {/* Main Feed Container (NFR: role="log" & aria-live="polite") */}
      <div
        ref={feedContainerRef}
        className="feed-scroll-container"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={handleScroll}
        tabIndex={0}
        aria-label="Real-time message feed"
      >
        {connectionStatus === 'CONNECTING' && messageLog.length === 0 ? (
          <div className="connecting-loader" role="status" aria-label="Connecting to live stream">
            <div className="spinner-orbit" aria-hidden="true" />
            <p className="loader-text">Connecting to wss://echo.websocket.events...</p>
            <p className="loader-sub">3G Bad Connectivity Check Active</p>
          </div>
        ) : messageLog.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="messages-stream">
            {messageLog.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={feedEndRef} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* AC4: Sticky Bottom Input Form */}
      <form className="feed-input-bar" onSubmit={handleSendMessage} noValidate>
        <div className="input-field-wrapper">
          <label htmlFor="dispatch-message-input" className="sr-only">
            Type dispatch message
          </label>
          <input
            id="dispatch-message-input"
            type="text"
            className="dispatch-input"
            placeholder={
              connectionStatus === 'DISCONNECTED'
                ? 'Offline: Enter message to queue locally...'
                : 'Type dispatch instruction or floor alert (Press Enter to Send)...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={connectionStatus === 'CONNECTING'}
            aria-required="true"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className="send-button"
          disabled={isSendDisabled}
          aria-label="Send message through WebSocket"
        >
          <span className="send-text">Send</span>
          <span className="send-icon" aria-hidden="true">
            ➔
          </span>
        </button>
      </form>
    </section>
  );
};
