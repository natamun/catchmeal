import { useState, type RefObject } from 'react';

import { useAuth } from '../../auth/auth-context';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { createMeal, deleteMeal, toApiDate, updateMeal } from '../meal/api';
import { draftsToInput, draftTotals, type MealItemDraft } from '../meal/draft';
import DraftItemList from '../meal/DraftItemList';
import { MEAL_TYPE_LABELS, type Meal, type MealType } from '../meal/types';
import { BaseDialog } from '../ui/BaseDialog';
import { MacroSummary } from '../ui/MacroSummary';

interface DailyMealFormProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  mealType: MealType;
  date: Date;
  initialItems: MealItemDraft[];
  sessionKey: number;
  existingMeals?: Meal[];
  onSaved: () => void;
}

export default function DailyMealForm({
  dialogRef,
  mealType,
  date,
  initialItems,
  sessionKey,
  existingMeals = [],
  onSaved,
}: DailyMealFormProps) {
  const { user } = useAuth();
  const userId = user!.userId;
  const [items, setItems] = useState<MealItemDraft[]>(initialItems);
  const [syncedKey, setSyncedKey] = useState(sessionKey);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (sessionKey !== syncedKey) {
    setSyncedKey(sessionKey);
    setItems(initialItems);
    setError(null);
  }

  const isEdit = existingMeals.length > 0;

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const adjustQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0 && !isEdit) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (!isEdit) {
        await createMeal(userId, {
          typeMeal: mealType,
          loggedAt: toApiDate(date),
          items: draftsToInput(items),
        });
      } else if (items.length === 0) {
        await Promise.all(
          existingMeals.map((meal) => deleteMeal(userId, meal.id)),
        );
      } else {
        const [first, ...others] = existingMeals;
        await updateMeal(userId, first.id, { items: draftsToInput(items) });
        await Promise.all(others.map((meal) => deleteMeal(userId, meal.id)));
      }
      dialogRef.current?.close();
      onSaved();
    } catch (err: unknown) {
      setError(requestErrorMessage(err, 'Une erreur est survenue, réessayez.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = draftTotals(items);

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title={`${isEdit ? 'Modifier' : 'Ajouter'} : ${MEAL_TYPE_LABELS[mealType]}`}
    >
      {items.length > 0 ? (
        <DraftItemList
          items={items}
          onAdjust={adjustQuantity}
          onRemove={removeItem}
        />
      ) : (
        <p className="py-4 text-center text-sm text-green-400">
          {isEdit
            ? 'Plus aucun aliment : enregistrer videra cette section.'
            : 'Aucun élément à ajouter.'}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-green-100 pt-5">
        {items.length > 0 && <MacroSummary totals={totals} />}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || (!isEdit && items.length === 0)}
          className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : isEdit
              ? 'Enregistrer'
              : 'Ajouter au journal'}
        </button>
      </div>
    </BaseDialog>
  );
}
