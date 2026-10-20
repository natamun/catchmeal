export type MacroKey = 'kcal' | 'protein' | 'carbs' | 'fat';

export type Macros = Record<MacroKey, number>;

export interface MacroFilter {
  min: number;
  max: number;
}

export interface SortOption {
  field: 'name' | MacroKey;
  direction: 'asc' | 'desc';
}

export interface FilterCriteria {
  query: string;
  kcal: MacroFilter;
  protein: MacroFilter;
  carbs: MacroFilter;
  fat: MacroFilter;
  sort: SortOption;
}

export const EMPTY_FILTER_CRITERIA: FilterCriteria = {
  query: '',
  kcal: { min: -Infinity, max: Infinity },
  protein: { min: -Infinity, max: Infinity },
  carbs: { min: -Infinity, max: Infinity },
  fat: { min: -Infinity, max: Infinity },
  sort: { field: 'name', direction: 'asc' },
};

export function matchesMacro(value: number, filter: MacroFilter) {
  return value >= filter.min && value <= filter.max;
}
