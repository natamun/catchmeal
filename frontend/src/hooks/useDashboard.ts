import { useEffect, useState } from 'react';

import { useCurrentUser } from '../auth/authContext';
import { getDashboard } from '../components/analytics/api';
import type { DashboardDay } from '../components/analytics/types';

const NO_DAYS: DashboardDay[] = [];

/**
 * Stats of a date range for the stats page. Each range is cached, so coming
 * back to a period already seen shows it instantly; `retry` reloads after an
 * error.
 */
export function useDashboard(from: string, to: string) {
  const { userId } = useCurrentUser();
  const key = `${userId}:${from}:${to}`;
  const [loaded, setLoaded] = useState<Record<string, DashboardDay[]>>({});
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const days = loaded[key] as DashboardDay[] | undefined;
  const isCached = days !== undefined;

  useEffect(() => {
    if (isCached) return;
    const controller = new AbortController();

    getDashboard(userId, from, to, controller.signal)
      .then((data) => setLoaded((previous) => ({ ...previous, [key]: data })))
      .catch(() => {
        if (!controller.signal.aborted) setFailedKey(key);
      });

    return () => controller.abort();
  }, [userId, from, to, key, isCached, attempt]);

  const hasError = !isCached && failedKey === key;

  return {
    days: days ?? NO_DAYS,
    isLoading: !isCached && !hasError,
    hasError,
    retry: () => {
      setFailedKey(null);
      setAttempt((count) => count + 1);
    },
  };
}
