import { request } from '../../utils/request';
import type { Message } from './types';

const messagesUrl = (userId: number) =>
  `${import.meta.env.VITE_API_URL}/users/${userId}/messages`;

/**
 * GET /users/:id/messages/:otherUserId: the conversation with one user. Sending
 * a message does not use this API but the socket (see useConversation).
 */
export function getConversation(userId: number, otherUserId: number) {
  return request<Message[]>(`${messagesUrl(userId)}/${otherUserId}`);
}

/**
 * GET /users/:id/messages/unread: the ids of the users who sent me unread
 * messages.
 */
export function getUnreadSenderIds(userId: number) {
  return request<number[]>(`${messagesUrl(userId)}/unread`);
}

/**
 * PATCH /users/:id/messages/:otherUserId/read: marks their messages to me as
 * read.
 */
export function markConversationRead(userId: number, otherUserId: number) {
  return request<{ count: number }>(
    `${messagesUrl(userId)}/${otherUserId}/read`,
    { method: 'PATCH' },
  );
}
