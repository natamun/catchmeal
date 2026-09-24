import type { FoodItem, FoodItemInput } from './types';

const BASE_URL: string = import.meta.env.VITE_API_URL;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export class ApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }
  return (await response.json()) as T;
}

function foodItemsUrl(userId: number) {
  return `${BASE_URL}/users/${userId}/food-items`;
}

export function listFoodItems(userId: number, signal?: AbortSignal) {
  return request<FoodItem[]>(foodItemsUrl(userId), { signal });
}

export function createFoodItem(userId: number, input: FoodItemInput) {
  return request<FoodItem>(foodItemsUrl(userId), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function updateFoodItem(
  userId: number,
  id: number,
  input: FoodItemInput,
) {
  return request<FoodItem>(`${foodItemsUrl(userId)}/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function deleteFoodItem(userId: number, id: number) {
  return request<FoodItem>(`${foodItemsUrl(userId)}/${id}`, {
    method: 'DELETE',
  });
}
