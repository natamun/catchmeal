import { useEffect } from "react";
import { mockDashboard } from "../assets/mockD";
import type { DashboardDay } from "../types/dashboard-analytics";

export default function useDashboard({ setDashboard, fromStr, toStr }: {
    setDashboard: (dashboard: DashboardDay[]) => void,
    fromStr: string,
    toStr: string}) {
    
    useEffect(() => {
        const controller = new AbortController();
        // if (!fromStr || !toStr) return;
        // fetch(`http://localhost:3000/users/1/dashboard?from=${fromStr}&to=${toStr}`, {
        //   signal: controller.signal,
        // })
        // .then(res => res.json())
        // .then(data => setDashboard(data))
        // .catch(err => {
        //   if (err.name !== 'AbortError') {
        //     console.log('Error log: ', err);
        //   }
        // });
    
        setDashboard(mockDashboard.filter(d => d.day >= fromStr && d.day <= toStr));
        return () => controller.abort();
      }, [fromStr, toStr]);
};