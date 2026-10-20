import type { DashboardDay, DataGraph, Grain, NumericKey } from './types';

const STEP: Record<Grain, number> = { day: 1, week: 7, biWeek: 14 };

export function averageOf(days: DashboardDay[], key: NumericKey) {
  const values = days.flatMap((day) => day[key] ?? []);

  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

const shortDate = (day: string) => day.slice(5).split('-').reverse().join('-');

export default function buildDataGraph(
  dashboard: DashboardDay[],
  grain: Grain,
): DataGraph[] {
  const step = STEP[grain];
  const result: DataGraph[] = [];

  for (let i = 0; i < dashboard.length; i += step) {
    const chunk = dashboard.slice(i, i + step);

    result.push({
      from: shortDate(chunk[0].day),
      date: shortDate(chunk[chunk.length - 1].day),
      kcal: averageOf(chunk, 'totalKcal'),
      protein: averageOf(chunk, 'totalProtein'),
      carbs: averageOf(chunk, 'totalCarbs'),
      fat: averageOf(chunk, 'totalFat'),
    });
  }
  return result;
}
