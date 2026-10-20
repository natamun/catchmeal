import { JSON_HEADERS, request } from '../../utils/request';
import type { FoodItem, FoodItemInput, OffProduct } from './types';

const BASE_URL: string = import.meta.env.VITE_API_URL;

function foodItemsUrl(userId: number) {
  return `${BASE_URL}/users/${userId}/food-items`;
}

/**
 * GET /users/:id/food-items: the user's whole food library, sorted by name,
 * archived foods included (the screens hide them).
 */
export function listFoodItems(userId: number, signal?: AbortSignal) {
  return request<FoodItem[]>(foodItemsUrl(userId), { signal });
}

/** POST /users/:id/food-items: adds a food to the library. */
export function createFoodItem(userId: number, input: FoodItemInput) {
  return request<FoodItem>(foodItemsUrl(userId), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** PATCH /users/:id/food-items/:foodId: saves the edited food. */
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

/**
 * DELETE /users/:id/food-items/:foodId: the backend archives the food instead
 * of deleting it, so the meals that use it keep their data.
 */
export function deleteFoodItem(userId: number, id: number) {
  return request<FoodItem>(`${foodItemsUrl(userId)}/${id}`, {
    method: 'DELETE',
  });
}

/**
 * GET /users/:id/off-products/:barcode: our backend asks Open Food Facts for
 * the product. Resolves to null when the barcode is unknown.
 */
export function lookupOffProduct(userId: number, barcode: string) {
  return request<{ product: OffProduct | null }>(
    `${BASE_URL}/users/${userId}/off-products/${encodeURIComponent(barcode)}`,
  ).then(({ product }) => product);
}
