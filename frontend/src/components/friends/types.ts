export interface UserSummary {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface Friend {
  friendshipId: number;
  friend: UserSummary;
}

export interface FriendRequest {
  requestId: number;
  from: UserSummary;
}

export interface FriendPresence {
  userId: number;
  online: boolean;
  lastSeenAt: string | null;
}

export interface ActivityItem {
  id: number;
  user: UserSummary;
  type:
    'MEAL_LOGGED' | 'WEIGHT_LOGGED' | 'GOAL_REACHED' | 'CALORIE_GOAL_CHANGED';
  message: string;
  createdAt: string;
}
