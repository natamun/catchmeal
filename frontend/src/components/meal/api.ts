import { CURRENT_USER_ID } from '../../constants/currentUser';
import type { Meal, MealInput } from './types';

const MEALS_URL = `${import.meta.env.VITE_API_URL}/users/${CURRENT_USER_ID}/meals`;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = body?.message;
  return Array.isArray(message)
    ? message.join(', ')
    : (message ?? `HTTP ${response.status}`);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response));
  }
  return (await response.json()) as T;
}

export function listMeals(logged?: boolean, signal?: AbortSignal) {
  const url =
    logged === undefined ? MEALS_URL : `${MEALS_URL}?logged=${logged}`;
  return request<Meal[]>(url, { signal });
}

export function toApiDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function listMealsOnDate(dateKey: string, signal?: AbortSignal) {
  return request<Meal[]>(`${MEALS_URL}?date=${dateKey}`, { signal });
}

export function createMeal(input: MealInput) {
  return request<Meal>(MEALS_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function updateMeal(id: number, input: MealInput) {
  return request<Meal>(`${MEALS_URL}/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function deleteMeal(id: number) {
  return request<Meal>(`${MEALS_URL}/${id}`, { method: 'DELETE' });
}
