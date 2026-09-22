import { CURRENT_USER_ID } from '../../constants/currentUser';
import type { Friend, FriendRequest, UserSummary } from './types';

const FRIENDS_URL = `${import.meta.env.VITE_API_URL}/users/${CURRENT_USER_ID}/friends`;
const USERS_URL = `${import.meta.env.VITE_API_URL}/users`;

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

export function listFriends(signal?: AbortSignal) {
  return request<Friend[]>(FRIENDS_URL, { signal });
}

export function listPendingRequests(signal?: AbortSignal) {
  return request<FriendRequest[]>(`${FRIENDS_URL}/pending`, { signal });
}

export function searchUsers(query: string, signal?: AbortSignal) {
  return request<UserSummary[]>(
    `${USERS_URL}?search=${encodeURIComponent(query)}`,
    { signal },
  );
}

export function sendFriendRequest(friendId: number) {
  return request<unknown>(FRIENDS_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ friendId }),
  });
}

export function acceptFriendRequest(id: number) {
  return request<unknown>(`${FRIENDS_URL}/${id}/accept`, { method: 'PATCH' });
}

export function removeFriendship(id: number) {
  return request<unknown>(`${FRIENDS_URL}/${id}`, { method: 'DELETE' });
}
