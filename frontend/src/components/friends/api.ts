import type { Friend, FriendRequest, UserSummary } from './types';

const USERS_URL = `${import.meta.env.VITE_API_URL}/users`;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const friendsUrl = (userId: number) =>
  `${import.meta.env.VITE_API_URL}/users/${userId}/friends`;

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

export function listFriends(userId: number, signal?: AbortSignal) {
  return request<Friend[]>(friendsUrl(userId), { signal });
}

export function listPendingRequests(userId: number, signal?: AbortSignal) {
  return request<FriendRequest[]>(`${friendsUrl(userId)}/pending`, { signal });
}

export function listSentRequests(userId: number, signal?: AbortSignal) {
  return request<number[]>(`${friendsUrl(userId)}/sent`, { signal });
}

export function searchUsers(query: string, signal?: AbortSignal) {
  return request<UserSummary[]>(
    `${USERS_URL}?search=${encodeURIComponent(query)}`,
    { signal },
  );
}

export function sendFriendRequest(userId: number, friendId: number) {
  return request<unknown>(friendsUrl(userId), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ friendId }),
  });
}

export function acceptFriendRequest(userId: number, id: number) {
  return request<unknown>(`${friendsUrl(userId)}/${id}/accept`, {
    method: 'PATCH',
  });
}

export function removeFriendship(userId: number, id: number) {
  return request<unknown>(`${friendsUrl(userId)}/${id}`, { method: 'DELETE' });
}
