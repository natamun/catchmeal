import { MACROS } from '../../constants/macros';
import { SERIES_COLORS } from './chartStyle';

export const MACRO_TOTAL_KEYS = {
  protein: 'totalProtein',
  carbs: 'totalCarbs',
  fat: 'totalFat',
} as const;

export const MACRO_SERIES = MACROS.map(({ key, label }, index) => ({
  key,
  label,
  fill: SERIES_COLORS[index],
  dataKey: `${key}Kcal` as const,
}));

export const UNSPLIT_SERIES = {
  label: 'Non réparti',
  fill: 'var(--color-green-100)',
  dataKey: 'otherKcal',
} as const;
