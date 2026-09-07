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