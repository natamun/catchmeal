import { JSON_HEADERS, request } from '../../utils/request';
import type { Meal, MealInput } from './types';

const BASE_URL: string = import.meta.env.VITE_API_URL;

function mealsUrl(userId: number) {
  return `${BASE_URL}/users/${userId}/meals`;
}

/**
 * GET /users/:id/meals: every meal, or with `logged` only the journal meals
 * (true) or only the library meals (false).
 */
export function listMeals(
  userId: number,
  logged?: boolean,
  signal?: AbortSignal,
) {
  const url =
    logged === undefined
      ? mealsUrl(userId)
      : `${mealsUrl(userId)}?logged=${logged}`;
  return request<Meal[]>(url, { signal });
}

/**
 * Formats a date as YYYY-MM-DD in local time, the only date format the meals
 * API accepts.
 */
export function toApiDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** GET /users/:id/meals?date=YYYY-MM-DD: the journal meals of one day. */
export function listMealsOnDate(
  userId: number,
  dateKey: string,
  signal?: AbortSignal,
) {
  return request<Meal[]>(`${mealsUrl(userId)}?date=${dateKey}`, { signal });
}

/**
 * POST /users/:id/meals: creates a journal meal (with loggedAt and typeMeal) or
 * a library meal (without them).
 */
export function createMeal(userId: number, input: MealInput) {
  return request<Meal>(mealsUrl(userId), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/**
 * PATCH /users/:id/meals/:mealId: sending `items` replaces all the meal's
 * items.
 */
export function updateMeal(userId: number, id: number, input: MealInput) {
  return request<Meal>(`${mealsUrl(userId)}/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/**
 * DELETE /users/:id/meals/:mealId: meals are really deleted, they are not
 * archived like foods.
 */
export function deleteMeal(userId: number, id: number) {
  return request<Meal>(`${mealsUrl(userId)}/${id}`, { method: 'DELETE' });
}
