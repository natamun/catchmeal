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
  noteWeight: string | null;
};

export type WeightPoint = { date: string; poids: number };

export type KcalPoint = { date: string; kcal: number; objectif: number };

export type DataGraph = {
  date: string;
  kcal: number;
  objective: number;
  weight: number;
};

export type Grain = 'day' | 'week' | 'biWeek';

export type NumericKey = 'totalKcal' | 'goalKcal' | 'weight';
