import { useEffect } from 'react';

// import { CURRENT_USER_ID } from '../constants/currentUser';
import { mockDashboard } from '../constants/mockD';
import type { DashboardDay } from '../types/dashboard-analytics';

// const url = `${import.meta.env.VITE_API_URL}/users/${CURRENT_USER_ID}/dashboard`;

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
    // fetch(`${url}?from=${fromStr}&to=${toStr}`, {
    //   signal: controller.signal,
    // })
    // .then(res => res.json())
    // .then(data => setDashboard(data))
    // .catch(err => {
    //   if (err.name !== 'AbortError') {
    //     console.log('Error log: ', err);
    //   }
    // });

    setDashboard(
      mockDashboard.filter((d) => d.day >= fromStr && d.day <= toStr),
    );
    return () => controller.abort();
  }, [setDashboard, fromStr, toStr]);
}
