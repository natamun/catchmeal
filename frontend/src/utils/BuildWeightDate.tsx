import type { DashboardDay, WeightPoint } from '../types/dashboard-analytics';

export default function buildWeightDate(
  dashboard: DashboardDay[],
): WeightPoint[] {
  let lastWeight: number | null = null;
  return dashboard.map((d) => {
    if (d.weight !== null) {
      lastWeight = d.weight;
    }
    if (lastWeight === null) {
      lastWeight = 0;
    }
    return { date: d.day.slice(5), poids: lastWeight };
  });
}
