import type { ActivityItem } from '../friends/types';

/**
 * A chat message. `activity` is the friend's activity it replies to, if any.
 */
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
  activity: ActivityItem | null;
}
