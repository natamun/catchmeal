/**
 * One day of stats as the backend returns it, with null when nothing was
 * logged. goalKcal is the calorie goal in force that day.
 */
export type DashboardDay = {
  day: string;
  totalKcal: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  weight: number | null;
  bodyFat: number | null;
  fatFreeMass: number | null;
  bodyWater: number | null;
  muscleMass: number | null;
  goalKcal: number | null;
  objective: string | null;
};

/**
 * One bar of the calorie chart: the average of a group of days. `from` and
 * `date` are its first and last day (DD-MM).
 */
export type DataGraph = {
  from: string;
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * A bar split by macro: its calories are shared between protein, carbs and fat
 * in proportion to their calories (4, 4 and 9 kcal per gram). `otherKcal` holds
 * the calories of a bar without any macro.
 */
export type KcalPoint = DataGraph & {
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  otherKcal: number;
};

/** How many days one bar groups: 1, 7 or 14. */
export type Grain = 'day' | 'week' | 'biWeek';

export type NumericKey =
  'totalKcal' | 'totalProtein' | 'totalCarbs' | 'totalFat';
