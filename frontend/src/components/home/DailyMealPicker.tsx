import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { listFoodItems } from '../food/api';
import FoodItemList from '../food/FoodItemList';
import type { FoodItem } from '../food/types';
import { listMeals } from '../meal/api';
import { buildDrafts, type MealItemDraft } from '../meal/draft';
import MealList from '../meal/MealList';
import { MEAL_TYPE_LABELS, type Meal, type MealType } from '../meal/types';
import { PillTabs } from '../ui/PillTabs';
import { SelectToggle } from '../ui/SelectToggle';
import DailyMealForm from './DailyMealForm';

type PickerTab = 'food' | 'meal';

const TAB_OPTIONS: { value: PickerTab; label: string }[] = [
  { value: 'food', label: 'Aliments' },
  { value: 'meal', label: 'Repas' },
];

function toggleInSet(prev: Set<number>, id: number) {
  const next = new Set(prev);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

interface DailyMealPickerProps {
  mealType: MealType;
  date: Date;
  onClose: () => void;
  onAdded: () => void;
}

export default function DailyMealPicker({
  mealType,
  date,
  onClose,
  onAdded,
}: DailyMealPickerProps) {
  const { user } = useAuth();
  const userId = user!.userId;
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [templates, setTemplates] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<PickerTab>('food');
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedMealIds, setSelectedMealIds] = useState<Set<number>>(
    new Set(),
  );
  const [review, setReview] = useState<{
    key: number;
    items: MealItemDraft[];
  }>({ key: 0, items: [] });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listFoodItems(userId, controller.signal),
      listMeals(userId, false, controller.signal),
    ])
      .then(([foods, meals]) => {
        setFoodItems(foods);
        setTemplates(meals);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setLoadError('Impossible de charger la bibliothèque. Réessayez.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [userId]);

  const selectedCount = selectedFoodIds.size + selectedMealIds.size;

  const openReview = () => {
    const items = buildDrafts(
      foodItems.filter((food) => selectedFoodIds.has(food.id)),
      templates.filter((meal) => selectedMealIds.has(meal.id)),
      foodItems,
    );
    setReview((prev) => ({ key: prev.key + 1, items }));
    dialogRef.current?.showModal();
  };

  return (
    <>
      <div className="flex animate-fade-in-up flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Retour à l'accueil"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="sr-only">Ajouter : {MEAL_TYPE_LABELS[mealType]}</h2>
          <PillTabs
            name="mealPickerTab"
            options={TAB_OPTIONS}
            value={tab}
            onChange={setTab}
          />
        </div>

        <div key={tab} className="animate-fade-in-up">
          {tab === 'food' ? (
            <FoodItemList
              items={foodItems}
              isLoading={isLoading}
              loadError={loadError}
              renderAction={(food) => (
                <SelectToggle
                  selected={selectedFoodIds.has(food.id)}
                  label={`Sélectionner ${food.name}`}
                  onToggle={() =>
                    setSelectedFoodIds((prev) => toggleInSet(prev, food.id))
                  }
                />
              )}
            />
          ) : (
            <MealList
              meals={templates}
              isLoading={isLoading}
              loadError={loadError}
              renderAction={(meal) => (
                <SelectToggle
                  selected={selectedMealIds.has(meal.id)}
                  label={`Sélectionner ${meal.name ?? 'ce repas'}`}
                  onToggle={() =>
                    setSelectedMealIds((prev) => toggleInSet(prev, meal.id))
                  }
                />
              )}
            />
          )}
        </div>

        <div className="sticky bottom-[calc(var(--spacing-bottom-nav)+1rem+env(safe-area-inset-bottom))] z-20 mx-3 flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-white p-3 shadow-lg md:mx-auto md:w-full md:max-w-md md:pointer-fine:bottom-4">
          <span className="text-sm text-green-600">
            {selectedCount === 0
              ? 'Aucune sélection'
              : `${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}`}
          </span>
          <button
            type="button"
            onClick={openReview}
            disabled={selectedCount === 0}
            className="cursor-pointer rounded-xl bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ajouter
          </button>
        </div>
      </div>

      <DailyMealForm
        dialogRef={dialogRef}
        mealType={mealType}
        date={date}
        initialItems={review.items}
        sessionKey={review.key}
        onSaved={onAdded}
      />
    </>
  );
}
