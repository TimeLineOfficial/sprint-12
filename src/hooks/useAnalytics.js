import { useCallback } from 'react';

/**
 * Custom Hook: useAnalytics
 * NFR: Telemetry Simulation - Logs structured telemetry to console.
 */
export function useAnalytics() {
  const trackEvent = useCallback((action, metadata = {}) => {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[Analytics] ${action}`,
      'color: #10b981; font-weight: bold; background: #111827; padding: 2px 6px; border-radius: 4px;',
      {
        action,
        timestamp,
        ...metadata,
      }
    );
  }, []);

  return { trackEvent };
}
