import { useEffect } from 'react';

import { CURRENT_USER_ID } from '../constants/currentUser';
import type { DashboardDay } from '../types/dashboard-analytics';

const API_URL = `${import.meta.env.VITE_API_URL}`;

export default function useDashboard({
  setDashboard,
  fromStr,
  toStr,
}: {
  setDashboard: React.Dispatch<React.SetStateAction<DashboardDay[]>>;
  fromStr: string;
  toStr: string;
}) {
  useEffect(() => {
    if (!fromStr || !toStr) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const param = new URLSearchParams({ from: fromStr, to: toStr });
        const res = await fetch(
          `${API_URL}/users/${CURRENT_USER_ID}/dashboard?${param}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as DashboardDay[];
        setDashboard(data);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error('useDashboard: ', error);
      }
    };
    void load();
    return () => controller.abort();
  }, [setDashboard, fromStr, toStr]);
}
