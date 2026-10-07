export interface UserSummary {
  id: number;
  username: string;
  name: string;
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
