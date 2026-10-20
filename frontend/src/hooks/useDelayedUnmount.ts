import { useEffect, useState } from 'react';

/**
 * Keeps returning the last value for `delayMs` after it becomes empty, so an
 * exit animation can still show it (toasts, error bubbles).
 */
export function useDelayedUnmount<T>(value: T, delayMs: number): T {
  const [displayed, setDisplayed] = useState(value);

  if (value && value !== displayed) {
    setDisplayed(value);
  }

  useEffect(() => {
    if (value) {
      return;
    }
    const timeoutId = setTimeout(() => setDisplayed(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return displayed;
}
