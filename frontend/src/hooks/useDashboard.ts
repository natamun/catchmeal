import { useEffect, useState } from 'react';

import { useAuth } from '../auth/auth-context';
import { getDashboard } from '../components/analytics/api';
import type { DashboardDay } from '../types/dashboard-analytics';

export default function useDashboard({
  fromStr,
  toStr,
  onError,
}: {
  fromStr: string;
  toStr: string;
  onError: (x: boolean) => void;
}) {
  const { user } = useAuth();
  const userId = user?.userId;
  const [dashboard, setDashboard] = useState<DashboardDay[]>([]);

  useEffect(() => {
    if (!fromStr || !toStr || !userId) return;
    const controller = new AbortController();

    getDashboard(userId, fromStr, toStr, controller.signal)
      .then((data) => {
        setDashboard(data);
        onError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) onError(true);
      });

    return () => controller.abort();
  }, [userId, fromStr, toStr, onError]);

  return { dashboard };
}
