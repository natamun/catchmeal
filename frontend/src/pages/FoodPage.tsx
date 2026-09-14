import { useEffect, useRef, useState } from 'react';

import { listFoodItems } from '../components/food/api';
import FoodItemForm from '../components/food/FoodItemForm';
import FoodItemList from '../components/food/FoodItemList';
import type { FoodItem } from '../components/food/types';
import { listMeals } from '../components/meal/api';
import MealForm from '../components/meal/MealForm';
import MealList from '../components/meal/MealList';
import type { Meal } from '../components/meal/types';
import { useDelayedUnmount } from '../hooks/useDelayedUnmount';

type Tab = 'food' | 'meal';

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'food', label: 'Aliments' },
  { value: 'meal', label: 'Repas' },
];

const LEGEND_ITEMS = [
  { label: 'Protéines', color: 'bg-rose-400' },
  { label: 'Glucides', color: 'bg-amber-400' },
  { label: 'Lipides', color: 'bg-blue-400' },
];

function useSupportsHover() {
  const [supportsHover, setSupportsHover] = useState(
    () => window.matchMedia('(hover: hover)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(hover: hover)');
    const handleChange = () => setSupportsHover(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return supportsHover;
}

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
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs whitespace-nowrap text-green-700 shadow-sm">
        {LEGEND_ITEMS.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
        <span className="text-green-400">Valeurs en grammes</span>
      </div>
    </div>
  );
}

export default function FoodPage() {
  const [activeTab, setActiveTab] = useState<Tab>('food');
  const [showLegend, setShowLegend] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isMealsLoading, setIsMealsLoading] = useState(true);
  const [mealsLoadError, setMealsLoadError] = useState<string | null>(null);
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
    listFoodItems(controller.signal)
      .then(setFoodItems)
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error(err);
        setLoadError('Impossible de charger tes aliments, réessaye.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    listMeals(controller.signal)
      .then(setMeals)
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error(err);
        setMealsLoadError('Impossible de charger tes repas, réessaye.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsMealsLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const openDialog = (item: FoodItem | null) => {
    setEditingItem(item);
    dialogRef.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 rounded-xl border border-green-200 bg-white p-1.5">
          {TAB_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-green-500 transition-colors has-checked:animate-pill-select has-checked:bg-green-500 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-400"
            >
              <input
                type="radio"
                name="foodPageTab"
                value={value}
                checked={activeTab === value}
                onChange={() => setActiveTab(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
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
        onMealAdded={(meal) => setMeals((prev) => [...prev, meal])}
      />

      <div key={activeTab} className="animate-fade-in-up">
        {activeTab === 'food' ? (
          <FoodItemList
            items={foodItems}
            isLoading={isLoading}
            loadError={loadError}
            onAdd={() => openDialog(null)}
            onEdit={(item) => openDialog(item)}
          />
        ) : (
          <MealList
            meals={meals}
            isLoading={isMealsLoading}
            loadError={mealsLoadError}
            onAdd={() => mealDialogRef.current?.showModal()}
          />
        )}
      </div>
    </div>
  );
}
