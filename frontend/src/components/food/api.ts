import { JSON_HEADERS, request } from '../../utils/request';
import type { FoodItem, FoodItemInput, OffProduct } from './types';

const BASE_URL: string = import.meta.env.VITE_API_URL;

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

export function lookupOffProduct(userId: number, barcode: string) {
  return request<OffProduct>(
    `${BASE_URL}/users/${userId}/off-products/${encodeURIComponent(barcode)}`,
  );
}
