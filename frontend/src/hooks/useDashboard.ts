import { useEffect } from 'react';

import { mockDashboard } from '../constants/mockD';
import type { DashboardDay } from '../types/dashboard-analytics';

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
    setDashboard(
      mockDashboard.filter((d) => d.day >= fromStr && d.day <= toStr),
    );
    return () => controller.abort();
  }, [setDashboard, fromStr, toStr]);
}
