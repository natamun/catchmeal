import { MACROS } from '../../constants/macros';
import { SERIES_COLORS } from './chartStyle';

/** The DashboardDay field that holds the daily total of each macro. */
export const MACRO_TOTAL_KEYS = {
  protein: 'totalProtein',
  carbs: 'totalCarbs',
  fat: 'totalFat',
} as const;

/** One chart series per macro, with its color. */
export const MACRO_SERIES = MACROS.map(({ key, label }, index) => ({
  key,
  label,
  fill: SERIES_COLORS[index],
  dataKey: `${key}Kcal` as const,
}));

/** Series for the calories that cannot be split by macro. */
export const UNSPLIT_SERIES = {
  label: 'Non réparti',
  fill: 'var(--color-green-100)',
  dataKey: 'otherKcal',
} as const;
