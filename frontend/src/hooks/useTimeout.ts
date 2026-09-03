import { useEffect, useEffectEvent } from 'react';

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
