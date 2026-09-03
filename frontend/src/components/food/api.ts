import { CURRENT_USER_ID } from '../../constants/currentUser';
import type { FoodItem, FoodItemInput } from './types';

const FOOD_ITEMS_URL = `${import.meta.env.VITE_API_URL}/users/${CURRENT_USER_ID}/food-items`;

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

export function listFoodItems(signal?: AbortSignal) {
  return request<FoodItem[]>(FOOD_ITEMS_URL, { signal });
}

export function createFoodItem(input: FoodItemInput) {
  return request<FoodItem>(FOOD_ITEMS_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function updateFoodItem(id: number, input: FoodItemInput) {
  return request<FoodItem>(`${FOOD_ITEMS_URL}/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function deleteFoodItem(id: number) {
  return request<FoodItem>(`${FOOD_ITEMS_URL}/${id}`, { method: 'DELETE' });
}
