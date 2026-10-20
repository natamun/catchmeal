import { hasTooManyDecimals, TOO_MANY_DECIMALS } from '../../utils/decimals';

export type QuickAddField = 'kcal' | 'protein' | 'carbs' | 'fat';

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

export function validateQuickAddForm(
  form: Record<QuickAddField, string>,
): Partial<Record<QuickAddField, string>> {
  const errors: Partial<Record<QuickAddField, string>> = {};

  for (const { field } of QUICK_ADD_FIELDS) {
    const value = Number(form[field]);
    if (form[field].trim() === '' || Number.isNaN(value) || value < 0) {
      errors[field] = 'Minimum 0';
    } else if (hasTooManyDecimals(form[field])) {
      errors[field] = TOO_MANY_DECIMALS;
    }
  }

  return errors;
}
