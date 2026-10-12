import { MACROS } from '../../constants/macros';

const FILLS = {
  protein: 'var(--color-green-600)',
  carbs: 'var(--color-green-400)',
  fat: 'var(--color-green-200)',
} as const;

export const MACRO_TOTAL_KEYS = {
  protein: 'totalProtein',
  carbs: 'totalCarbs',
  fat: 'totalFat',
} as const;

export const MACRO_SERIES = MACROS.map(({ key, label }) => ({
  key,
  label,
  fill: FILLS[key],
  dataKey: `${key}Kcal` as const,
}));

export const UNSPLIT_SERIES = {
  label: 'Non réparti',
  fill: 'var(--color-green-100)',
  dataKey: 'otherKcal',
} as const;
