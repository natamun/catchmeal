import { useEffect, useEffectEvent } from 'react';

/**
 * Calls `callback` after `delayMs`, or never while `delayMs` is null. The timer
 * restarts when the delay changes and is cleared on unmount; useEffectEvent
 * always runs the latest callback without restarting the timer.
 */
export function useTimeout(callback: () => void, delayMs: number | null) {
  const onTimeout = useEffectEvent(callback);

  useEffect(() => {
    if (delayMs === null) {
      return;
    }
    const timeoutId = setTimeout(() => onTimeout(), delayMs);
    return () => clearTimeout(timeoutId);
  }, [delayMs]);
}
