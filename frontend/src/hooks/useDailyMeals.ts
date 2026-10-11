import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../auth/auth-context';
import { listFoodItems } from '../components/food/api';
import type { FoodItem } from '../components/food/types';
import { listMealsOnDate, toApiDate } from '../components/meal/api';
import type { Meal } from '../components/meal/types';

const PREFETCH_DELAY_MS = 200;
const NO_MEALS: Meal[] = [];

function neighbourKey(dateKey: string, offset: number) {
  const day = new Date(`${dateKey}T12:00:00`);
  day.setDate(day.getDate() + offset);
  return toApiDate(day);
}

export function useDailyMeals(date: Date) {
  const { user } = useAuth();
  const userId = user!.userId;
  const dateKey = toApiDate(date);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodsError, setFoodsError] = useState<string | null>(null);
  const [foodsAttempt, setFoodsAttempt] = useState(0);
  const [days, setDays] = useState<Record<string, Meal[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const loaded = useRef(new Set<string>());
  const pending = useRef(new Set<string>());
  const lifetime = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    listFoodItems(userId, controller.signal)
      .then(setFoodItems)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setFoodsError('Impossible de charger les aliments.');
      });
    return () => controller.abort();
  }, [userId, foodsAttempt]);

  useEffect(() => {
    const controller = new AbortController();
    const inFlight = pending.current;
    lifetime.current = controller;
    return () => {
      controller.abort();
      inFlight.clear();
    };
  }, []);

  const loadDay = useCallback(
    (dayKey: string) => {
      const cacheKey = `${userId}:${dayKey}`;
      if (pending.current.has(cacheKey)) return;
      pending.current.add(cacheKey);
      const signal = lifetime.current?.signal;

      listMealsOnDate(userId, dayKey, signal)
        .then((meals) => {
          loaded.current.add(cacheKey);
          setDays((prev) => ({ ...prev, [cacheKey]: meals }));
          setErrors((prev) => {
            if (!(cacheKey in prev)) return prev;
            const next = { ...prev };
            delete next[cacheKey];
            return next;
          });
        })
        .catch((err: unknown) => {
          if (signal?.aborted) return;
          console.error(err);
          setErrors((prev) => ({
            ...prev,
            [cacheKey]: 'Impossible de charger le journal.',
          }));
        })
        .finally(() => {
          if (!signal?.aborted) pending.current.delete(cacheKey);
        });
    },
    [userId],
  );

  useEffect(() => {
    if (!loaded.current.has(`${userId}:${dateKey}`)) loadDay(dateKey);

    const timer = setTimeout(() => {
      [-1, 1].forEach((offset) => {
        const neighbour = neighbourKey(dateKey, offset);
        if (!loaded.current.has(`${userId}:${neighbour}`)) loadDay(neighbour);
      });
    }, PREFETCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [userId, dateKey, loadDay]);

  const cacheKey = `${userId}:${dateKey}`;
  const meals = days[cacheKey];
  const dayError = errors[cacheKey];

  return {
    meals: meals ?? NO_MEALS,
    foodItems,
    isReady: meals !== undefined,
    isLoading: meals === undefined && dayError === undefined,
    loadError: dayError ?? foodsError,
    reload: () => loadDay(dateKey),
    retry: () => {
      if (foodsError !== null) {
        setFoodsError(null);
        setFoodsAttempt((attempt) => attempt + 1);
      }
      setErrors((prev) => {
        if (!(cacheKey in prev)) return prev;
        const next = { ...prev };
        delete next[cacheKey];
        return next;
      });
      loadDay(dateKey);
    },
  };
}
