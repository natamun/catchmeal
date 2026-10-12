export type DashboardDay = {
  day: string;
  totalKcal: number | null;
  goalKcal: number | null;
  weight: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  objective: string | null;
  bodyFat: number | null;
};

export type DataGraph = {
  from: string;
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type KcalPoint = DataGraph & {
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  otherKcal: number;
};

export type Grain = 'day' | 'week' | 'biWeek';

export type NumericKey =
  'totalKcal' | 'totalProtein' | 'totalCarbs' | 'totalFat';
