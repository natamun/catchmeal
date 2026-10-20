import { useState, type RefObject } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight } from 'lucide-react';

import { useCurrentUser } from '../../auth/auth-context';
import { useTimeout } from '../../hooks/useTimeout';
import { parseDecimal } from '../../utils/decimals';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { createMeal, toApiDate } from '../meal/api';
import {
  EMPTY_QUICK_ADD_FORM,
  QUICK_ADD_FIELDS,
  validateQuickAddForm,
  type QuickAddField,
} from '../meal/quickMealAdd';
import { MEAL_TYPE_LABELS, type MealType } from '../meal/types';
import { BaseDialog } from '../ui/BaseDialog';
import { DropdownPanel } from '../ui/DropdownPanel';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';

const MEAL_TYPE_OPTIONS = (Object.keys(MEAL_TYPE_LABELS) as MealType[]).map(
  (value) => ({ value, label: MEAL_TYPE_LABELS[value] }),
);

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) {
    return 'BREAKFAST';
  }
  if (hour < 15) {
    return 'LUNCH';
  }
  if (hour < 18) {
    return 'SNACK';
  }
  return 'DINNER';
}

interface QuickAddDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  date: Date;
  onSaved: () => void;
}

export default function QuickAddDialog({
  dialogRef,
  date,
  onSaved,
}: QuickAddDialogProps) {
  const { userId } = useCurrentUser();
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [form, setForm] = useState(EMPTY_QUICK_ADD_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<QuickAddField, boolean>>
  >({});
  const [focusedField, setFocusedField] = useState<QuickAddField | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);

  const errors = validateQuickAddForm(form);

  const reset = () => {
    setMealType(defaultMealType());
    setForm(EMPTY_QUICK_ADD_FORM);
    setTouched({});
    setFocusedField(null);
    setSubmitAttempted(false);
    setCategoryOpen(false);
    setError(null);
  };

  const handleChange = (field: QuickAddField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: QuickAddField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((current) => (current === field ? null : current));
  };

  const isInvalid = (field: QuickAddField) =>
    Boolean(touched[field] && errors[field]);

  const errorMessage = (field: QuickAddField) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setTouched(
      Object.fromEntries(QUICK_ADD_FIELDS.map(({ field }) => [field, true])),
    );

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await createMeal(userId, {
        typeMeal: mealType,
        loggedAt: toApiDate(date),
        items: [
          {
            quantity: 1,
            kcal: parseDecimal(form.kcal) ?? 0,
            protein: parseDecimal(form.protein) ?? 0,
            carbs: parseDecimal(form.carbs) ?? 0,
            fat: parseDecimal(form.fat) ?? 0,
          },
        ],
      });
      dialogRef.current?.close();
      onSaved();
    } catch (err: unknown) {
      setError(requestErrorMessage(err, 'Une erreur est survenue, réessayez.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title="Ajout rapide"
      onClose={reset}
      onDialogNode={setDialogNode}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        autoComplete="off"
        className="flex flex-col gap-5"
      >
        <Popover.Root open={categoryOpen} onOpenChange={setCategoryOpen}>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-add-meal-type"
              className="text-xs text-green-500"
            >
              Catégorie
            </label>
            <Popover.Trigger asChild>
              <button
                id="quick-add-meal-type"
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 transition-colors hover:bg-green-50 aria-expanded:bg-green-50"
              >
                {MEAL_TYPE_LABELS[mealType]}
                <ChevronRight
                  className={`h-4 w-4 text-green-400 transition-transform ${categoryOpen ? 'rotate-90' : ''}`}
                />
              </button>
            </Popover.Trigger>
          </div>
          <DropdownPanel container={dialogNode} matchAnchorWidth moveFocus>
            {MEAL_TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-current={value === mealType}
                onClick={() => {
                  setMealType(value);
                  setCategoryOpen(false);
                }}
                className={`cursor-pointer border-t border-green-100 px-4 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-green-50 ${
                  value === mealType
                    ? 'font-semibold text-green-800'
                    : 'text-green-600'
                }`}
              >
                {label}
              </button>
            ))}
          </DropdownPanel>
        </Popover.Root>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ADD_FIELDS.map(({ field, label }) => (
            <div key={field} className="relative flex flex-col gap-1">
              <label
                htmlFor={`quick-add-${field}`}
                className="text-xs text-green-500"
              >
                {label}
              </label>
              <Input
                id={`quick-add-${field}`}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => handleBlur(field)}
                aria-invalid={isInvalid(field)}
                aria-describedby={`quick-add-${field}-error`}
                autoComplete="off"
              />
              <FieldError
                id={`quick-add-${field}-error`}
                message={errorMessage(field)}
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enregistrement...' : 'Ajouter au journal'}
        </button>
      </form>
    </BaseDialog>
  );
}
