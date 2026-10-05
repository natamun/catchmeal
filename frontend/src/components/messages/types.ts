import type { ActivityItem } from '../friends/types';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
  activity: ActivityItem | null;
}
