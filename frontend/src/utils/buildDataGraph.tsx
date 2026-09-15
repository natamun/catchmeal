import type {
  DashboardDay,
  DataGraph,
  Grain,
  NumericKey,
  WeightPoint,
} from '../types/dashboard-analytics';

const STEP: Record<Grain, number> = { day: 1, week: 7, biWeek: 14 };

const averageCalculate = (
  data: DashboardDay[],
  key: NumericKey,
): number | null => {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const value = data[i][key];
    if (value !== null && value !== undefined) {
      sum += value;
      count++;
    }
  }
  if (count === 0) return null;
  return sum / count;
};

const averageWeigth = (data: WeightPoint[]): number | null => {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const value: number = data[i].poids;
    if (value !== null && value !== undefined) {
      sum += value;
      count++;
    }
  }
  if (count === 0) return null;
  return sum / count;
};

function fillWeigthDaily(dashboard: DashboardDay[]): WeightPoint[] {
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

export default function buildDataGraph(
  dashboard: DashboardDay[],
  grain: Grain,
): DataGraph[] {
  const weigthData = fillWeigthDaily(dashboard);
  const step = STEP[grain];
  const result: DataGraph[] = [];

  for (let i = 0; i < dashboard.length; i += step) {
    const chunk = dashboard.slice(i, i + step);
    const chunkWeigth = weigthData.slice(i, i + step);
    const date = chunk[chunk.length - 1].day
      .slice(5)
      .split('-')
      .reverse()
      .join('-');
    const kcal = averageCalculate(chunk, 'totalKcal');
    const goal = averageCalculate(chunk, 'goalKcal');
    const weight = averageWeigth(chunkWeigth);
    const weightValue = weight === null ? 0 : Math.round(weight * 10) / 10;
    result.push({
      date: date,
      kcal: Math.round(kcal ?? 0),
      objective: Math.round(goal ?? 0),
      weight: weightValue,
    });
  }
  return result;
}
