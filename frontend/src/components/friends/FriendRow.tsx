import { MessageCircle, X } from 'lucide-react';

import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { Avatar } from '../ui/Avatar';
import type { UserSummary } from './types';

interface FriendRowProps {
  friend: UserSummary;
  online: boolean;
  lastSeenAt: string | null;
  hasUnread: boolean;
  onMessage: () => void;
  onRemove: () => void;
}

export function FriendRow({
  friend,
  online,
  lastSeenAt,
  hasUnread,
  onMessage,
  onRemove,
}: FriendRowProps) {
  return (
    <li className="flex items-center gap-4 border-b border-green-200 px-5 py-4 last:border-b-0">
      <Avatar
        username={friend.username}
        avatarUrl={friend.avatarUrl}
        online={online}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-green-800">
          {friend.name}
        </p>
        <p className="truncate text-xs text-green-500">
          {online
            ? 'En ligne'
            : lastSeenAt
              ? formatRelativeTime(lastSeenAt)
              : `@${friend.username}`}
        </p>
      </div>
      <button
        type="button"
        onClick={onMessage}
        aria-label={
          hasUnread
            ? `Nouveaux messages de ${friend.username}`
            : `Envoyer un message à ${friend.username}`
        }
        className="relative shrink-0 cursor-pointer text-green-400 transition-colors hover:text-green-600"
      >
        <MessageCircle className="h-4 w-4" />
        {hasUnread && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-3 w-3"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 motion-safe:animate-unread-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${friend.username}`}
        className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}
