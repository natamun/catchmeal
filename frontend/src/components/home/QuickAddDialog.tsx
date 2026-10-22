import { useState, type RefObject } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight } from 'lucide-react';

import { useCurrentUser } from '../../auth/authContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { parseDecimal } from '../../utils/decimals';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { createMeal, toApiDate } from '../meal/api';
import {
  EMPTY_QUICK_ADD_FORM,
  QUICK_ADD_FIELDS,
  validateQuickAddForm,
} from '../meal/quickMealAdd';
import { MEAL_TYPE_LABELS, type MealType } from '../meal/types';
import { BaseDialog } from '../ui/BaseDialog';
import { DropdownPanel } from '../ui/DropdownPanel';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';

const MEAL_TYPE_OPTIONS = (Object.keys(MEAL_TYPE_LABELS) as MealType[]).map(
  (value) => ({ value, label: MEAL_TYPE_LABELS[value] }),
);

/**
 * Suggests a section from the time of day: breakfast before 10:00, lunch before
 * 15:00, snack before 18:00, then dinner.
 */
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

/**
 * Logs calories and macros typed by hand, without a food of the library, into
 * one section of the day.
 */
export function QuickAddDialog({
  dialogRef,
  date,
  onSaved,
}: QuickAddDialogProps) {
  const { userId } = useCurrentUser();
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const {
    form,
    setForm,
    handleFocus,
    handleBlur,
    handleChange,
    isInvalid,
    errorMessage,
    attemptSubmit,
    resetValidation,
  } = useFormValidation(EMPTY_QUICK_ADD_FORM, validateQuickAddForm);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setMealType(defaultMealType());
    setForm(EMPTY_QUICK_ADD_FORM);
    resetValidation();
    setCategoryOpen(false);
    setError(null);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!attemptSubmit()) {
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
                aria-haspopup="listbox"
                aria-expanded={categoryOpen}
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
                onFocus={() => handleFocus(field)}
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
