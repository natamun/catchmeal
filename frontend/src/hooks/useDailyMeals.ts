import { useEffect, useState } from 'react';

import { useAuth } from '../auth/auth-context';
import { listFoodItems } from '../components/food/api';
import type { FoodItem } from '../components/food/types';
import { listMealsOnDate, toApiDate } from '../components/meal/api';
import type { Meal } from '../components/meal/types';

interface DayResult {
  requestKey: string;
  meals: Meal[];
  error: string | null;
}

export function useDailyMeals(date: Date) {
  const { user } = useAuth();
  const userId = user!.userId;
  const dateKey = toApiDate(date);
  const [reloadCount, setReloadCount] = useState(0);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodsError, setFoodsError] = useState<string | null>(null);
  const [result, setResult] = useState<DayResult | null>(null);
  const requestKey = `${dateKey}:${reloadCount}`;

  useEffect(() => {
    const controller = new AbortController();
    listFoodItems(userId, controller.signal)
      .then(setFoodItems)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setFoodsError('Impossible de charger tes aliments, réessaye.');
      });
    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    listMealsOnDate(userId, dateKey, controller.signal)
      .then((meals) => setResult({ requestKey, meals, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setResult({
          requestKey,
          meals: [],
          error: 'Impossible de charger ton journal, réessaye.',
        });
      });
    return () => controller.abort();
  }, [userId, dateKey, requestKey]);

  const current = result && result.requestKey === requestKey ? result : null;

  return {
    meals: current?.meals ?? [],
    foodItems,
    isLoading: current === null,
    loadError: current?.error ?? foodsError,
    reload: () => setReloadCount((count) => count + 1),
  };
}
