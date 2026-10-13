import { JSON_HEADERS, request } from '../../utils/request';
import type { Meal, MealInput } from './types';

const BASE_URL: string = import.meta.env.VITE_API_URL;

function mealsUrl(userId: number) {
  return `${BASE_URL}/users/${userId}/meals`;
}

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

export function toApiDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function listMealsOnDate(
  userId: number,
  dateKey: string,
  signal?: AbortSignal,
) {
  return request<Meal[]>(`${mealsUrl(userId)}?date=${dateKey}`, { signal });
}

export function createMeal(userId: number, input: MealInput) {
  return request<Meal>(mealsUrl(userId), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function updateMeal(userId: number, id: number, input: MealInput) {
  return request<Meal>(`${mealsUrl(userId)}/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function deleteMeal(userId: number, id: number) {
  return request<Meal>(`${mealsUrl(userId)}/${id}`, { method: 'DELETE' });
}
