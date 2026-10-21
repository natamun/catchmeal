/** The public part of a user, shown in lists (no email). */
export interface UserSummary {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

/** An accepted friendship; friendshipId is what removeFriendship needs. */
export interface Friend {
  friendshipId: number;
  friend: UserSummary;
}

/** A request I received; requestId is used to accept or decline it. */
export interface FriendRequest {
  requestId: number;
  from: UserSummary;
}

/** lastSeenAt is null while the friend is online. */
export interface FriendPresence {
  userId: number;
  online: boolean;
  lastSeenAt: string | null;
}

/**
 * An event of a friend shown in the feed. `message` is the sentence built by
 * the backend.
 */
export interface ActivityItem {
  id: number;
  user: UserSummary;
  type:
    'MEAL_LOGGED' | 'WEIGHT_LOGGED' | 'GOAL_REACHED' | 'CALORIE_GOAL_CHANGED';
  message: string;
  createdAt: string;
}
