import { request } from '../../utils/request';
import type { Message } from './types';

const messagesUrl = (userId: number) =>
  `${import.meta.env.VITE_API_URL}/users/${userId}/messages`;

export function getConversation(userId: number, otherUserId: number) {
  return request<Message[]>(`${messagesUrl(userId)}/${otherUserId}`);
}
