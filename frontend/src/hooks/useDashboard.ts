import { useEffect, useState } from 'react';

import { useAuth } from '../auth/auth-context';
import type { DashboardDay } from '../types/dashboard-analytics';

const API_URL = `${import.meta.env.VITE_API_URL}`;

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
  const [dashboard, setDashboardState] = useState<DashboardDay[]>([]);

  useEffect(() => {
    if (!fromStr || !toStr || !userId) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const param = new URLSearchParams({ from: fromStr, to: toStr });
        const res = await fetch(
          `${API_URL}/users/${userId}/dashboard?${param}`,
          { signal: controller.signal, credentials: 'include' },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as DashboardDay[];
        setDashboardState(data);
        onError(false);
      } catch (error) {
        onError(true);
        console.error('useDashboard: ', error);
        if ((error as Error).name === 'AbortError') return;
      }
    };

    void load();
    return () => controller.abort();
  }, [userId, fromStr, toStr, onError]);

  return { dashboard, setDashboard: setDashboardState };
}
