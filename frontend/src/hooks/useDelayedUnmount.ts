import { useEffect, useState } from 'react';

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
