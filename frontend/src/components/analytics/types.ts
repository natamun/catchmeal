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
