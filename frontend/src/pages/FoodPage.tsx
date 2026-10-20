import { useEffect, useRef, useState } from 'react';

import { useCurrentUser } from '../auth/authContext';
import { listFoodItems } from '../components/food/api';
import FoodItemForm from '../components/food/FoodItemForm';
import FoodItemList from '../components/food/FoodItemList';
import type { FoodItem } from '../components/food/types';
import { listMeals } from '../components/meal/api';
import MealForm from '../components/meal/MealForm';
import MealList from '../components/meal/MealList';
import type { Meal } from '../components/meal/types';
import { AddCircleButton } from '../components/ui/AddCircleButton';
import { EditIconButton } from '../components/ui/EditIconButton';
import { PillTabs } from '../components/ui/PillTabs';
import { MACROS } from '../constants/macros';
import { useDelayedUnmount } from '../hooks/useDelayedUnmount';
import { useSupportsHover } from '../hooks/useSupportsHover';
import { ApiError } from '../utils/request';

type Tab = 'food' | 'meal';

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'food', label: 'Aliments' },
  { value: 'meal', label: 'Repas' },
];

function LegendBubble({ show }: { show: boolean }) {
  const displayed = useDelayedUnmount(show, 100);

  if (!displayed) {
    return null;
  }

  return (
    <div
      className={`absolute top-full right-0 z-10 mt-1.5 ${show ? 'animate-fade-in-up' : 'animate-fade-out'}`}
    >
      <div className="absolute -top-1 right-4 h-2 w-2 rotate-45 border-t border-l border-green-200 bg-white" />
      <div className="flex flex-col items-start gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs whitespace-nowrap text-green-700 shadow-sm min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-3">
        <div className="flex items-center gap-3">
          {MACROS.map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
        <span className="text-green-400">Valeurs en grammes</span>
      </div>
    </div>
  );
}

export default function FoodPage() {
  const { userId } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('food');
  const [showLegend, setShowLegend] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [foodsAttempt, setFoodsAttempt] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isMealsLoading, setIsMealsLoading] = useState(true);
  const [mealsLoadError, setMealsLoadError] = useState<string | null>(null);
  const [mealsAttempt, setMealsAttempt] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mealDialogRef = useRef<HTMLDialogElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const supportsHover = useSupportsHover();

  useEffect(() => {
    if (supportsHover || !showLegend) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !legendRef.current?.contains(event.target)
      ) {
        setShowLegend(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [supportsHover, showLegend]);

  useEffect(() => {
    const controller = new AbortController();
    listFoodItems(userId, controller.signal)
      .then(setFoodItems)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 403) return;
        setLoadError('Impossible de charger les aliments.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [userId, foodsAttempt]);

  useEffect(() => {
    const controller = new AbortController();
    listMeals(userId, false, controller.signal)
      .then(setMeals)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 403) return;
        setMealsLoadError('Impossible de charger les repas.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsMealsLoading(false);
        }
      });
    return () => controller.abort();
  }, [userId, mealsAttempt]);

  const openDialog = (item: FoodItem | null) => {
    setEditingItem(item);
    dialogRef.current?.showModal();
  };

  const openMealDialog = (meal: Meal | null) => {
    setEditingMeal(meal);
    mealDialogRef.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Alimentation</h1>
      <div className="flex items-center justify-between gap-3">
        <PillTabs
          name="foodPageTab"
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div
          ref={legendRef}
          className="relative"
          onMouseEnter={() => supportsHover && setShowLegend(true)}
          onMouseLeave={() => supportsHover && setShowLegend(false)}
        >
          <button
            type="button"
            onClick={() => !supportsHover && setShowLegend((prev) => !prev)}
            aria-expanded={showLegend}
            aria-label="Afficher la légende des couleurs"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-green-200 text-xs font-bold text-green-500 transition-colors hover:bg-green-50"
          >
            ?
          </button>
          <LegendBubble show={showLegend} />
        </div>
      </div>

      <FoodItemForm
        dialogRef={dialogRef}
        editingItem={editingItem}
        foodItems={foodItems}
        onItemAdded={(item) => setFoodItems((prev) => [...prev, item])}
        onItemUpdated={(updated) =>
          setFoodItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          )
        }
        onItemDeleted={(id) =>
          setFoodItems((prev) => prev.filter((item) => item.id !== id))
        }
      />

      <MealForm
        dialogRef={mealDialogRef}
        foodItems={foodItems}
        editingMeal={editingMeal}
        onMealAdded={(meal) => setMeals((prev) => [...prev, meal])}
        onMealUpdated={(updated) =>
          setMeals((prev) =>
            prev.map((meal) => (meal.id === updated.id ? updated : meal)),
          )
        }
        onMealDeleted={(id) =>
          setMeals((prev) => prev.filter((meal) => meal.id !== id))
        }
      />

      <div key={activeTab} className="animate-fade-in-up">
        {activeTab === 'food' ? (
          <FoodItemList
            items={foodItems}
            isLoading={isLoading}
            loadError={loadError}
            onRetry={() => {
              setLoadError(null);
              setIsLoading(true);
              setFoodsAttempt((attempt) => attempt + 1);
            }}
            headerAction={
              <AddCircleButton
                label="Ajouter un aliment"
                onClick={() => openDialog(null)}
              />
            }
            renderAction={(item) => (
              <EditIconButton
                label={`Modifier ${item.name}`}
                onClick={() => openDialog(item)}
              />
            )}
          />
        ) : (
          <MealList
            meals={meals}
            isLoading={isMealsLoading}
            loadError={mealsLoadError}
            onRetry={() => {
              setMealsLoadError(null);
              setIsMealsLoading(true);
              setMealsAttempt((attempt) => attempt + 1);
            }}
            headerAction={
              <AddCircleButton
                label="Ajouter un repas"
                onClick={() => openMealDialog(null)}
              />
            }
            renderAction={(meal) => (
              <EditIconButton
                label={`Modifier ${meal.name ?? 'ce repas'}`}
                onClick={() => openMealDialog(meal)}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}
