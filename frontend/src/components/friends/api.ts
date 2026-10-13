import { JSON_HEADERS, request } from '../../utils/request';
import {
  type ActivityItem,
  type Friend,
  type FriendPresence,
  type FriendRequest,
  type UserSummary,
} from './types';

const USERS_URL = `${import.meta.env.VITE_API_URL}/users`;

const friendsUrl = (userId: number) =>
  `${import.meta.env.VITE_API_URL}/users/${userId}/friends`;

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

export function getFriendsPresence(signal?: AbortSignal) {
  return request<FriendPresence[]>(`${import.meta.env.VITE_API_URL}/presence`, {
    signal,
  });
}

export function getFriendsActivity(userId: number, signal?: AbortSignal) {
  return request<ActivityItem[]>(`${USERS_URL}/${userId}/activities`, {
    signal,
  });
}
