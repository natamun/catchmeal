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

/** GET /users/:id/friends: the accepted friendships. */
export function listFriends(userId: number, signal?: AbortSignal) {
  return request<Friend[]>(friendsUrl(userId), { signal });
}

/** GET /users/:id/friends/pending: the requests other users sent me. */
export function listPendingRequests(userId: number, signal?: AbortSignal) {
  return request<FriendRequest[]>(`${friendsUrl(userId)}/pending`, { signal });
}

/**
 * GET /users/:id/friends/sent: the ids of the users I sent a pending request
 * to.
 */
export function listSentRequests(userId: number, signal?: AbortSignal) {
  return request<number[]>(`${friendsUrl(userId)}/sent`, { signal });
}

/**
 * GET /users?search=: up to 20 users whose username contains the text, deleted
 * accounts excluded.
 */
export function searchUsers(query: string, signal?: AbortSignal) {
  return request<UserSummary[]>(
    `${USERS_URL}?search=${encodeURIComponent(query)}`,
    { signal },
  );
}

/** POST /users/:id/friends: sends a friend request to `friendId`. */
export function sendFriendRequest(userId: number, friendId: number) {
  return request<unknown>(friendsUrl(userId), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ friendId }),
  });
}

/** PATCH /users/:id/friends/:requestId/accept: accepts a received request. */
export function acceptFriendRequest(userId: number, id: number) {
  return request<unknown>(`${friendsUrl(userId)}/${id}/accept`, {
    method: 'PATCH',
  });
}

/**
 * DELETE /users/:id/friends/:id: removes a friend or declines a request; the
 * backend uses the same route for both.
 */
export function removeFriendship(userId: number, id: number) {
  return request<unknown>(`${friendsUrl(userId)}/${id}`, { method: 'DELETE' });
}

/**
 * GET /presence: which of my friends are online, and when the others were last
 * seen.
 */
export function getFriendsPresence(signal?: AbortSignal) {
  return request<FriendPresence[]>(`${import.meta.env.VITE_API_URL}/presence`, {
    signal,
  });
}

/**
 * GET /users/:id/activities: my friends' 30 latest activities (meal logged,
 * goal reached...).
 */
export function getFriendsActivity(userId: number, signal?: AbortSignal) {
  return request<ActivityItem[]>(`${USERS_URL}/${userId}/activities`, {
    signal,
  });
}
