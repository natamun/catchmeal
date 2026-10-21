import {
  hasTooManyDecimals,
  parseDecimal,
  TOO_MANY_DECIMALS,
} from '../../utils/decimals';

export type QuickAddField = 'kcal' | 'protein' | 'carbs' | 'fat';

/**
 * Fields of a quick add: calories and macros typed by hand, without a food of
 * the library.
 */
export const QUICK_ADD_FIELDS: { field: QuickAddField; label: string }[] = [
  { field: 'kcal', label: 'Kcal' },
  { field: 'protein', label: 'Protéines (g)' },
  { field: 'carbs', label: 'Glucides (g)' },
  { field: 'fat', label: 'Lipides (g)' },
];

export const EMPTY_QUICK_ADD_FORM: Record<QuickAddField, string> = {
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
};

/** Every field is required, 0 or more, with 2 decimals at most. */
export function validateQuickAddForm(
  form: Record<QuickAddField, string>,
): Partial<Record<QuickAddField, string>> {
  const errors: Partial<Record<QuickAddField, string>> = {};

  for (const { field } of QUICK_ADD_FIELDS) {
    const value = parseDecimal(form[field]);
    if (value === null || Number.isNaN(value) || value < 0) {
      errors[field] = 'Minimum 0';
    } else if (hasTooManyDecimals(form[field])) {
      errors[field] = TOO_MANY_DECIMALS;
    }
  }

  return errors;
}
