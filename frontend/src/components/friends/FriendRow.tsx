import { MessageCircle, X } from 'lucide-react';

import { Avatar } from './Avatar';
import type { UserSummary } from './types';

interface FriendRowProps {
  friend: UserSummary;
  online: boolean;
  lastSeenAt: string | null;
  onMessage: () => void;
  onRemove: () => void;
}

export default function FriendRow({
  friend,
  online,
  lastSeenAt,
  onMessage,
  onRemove,
}: FriendRowProps) {
  return (
    <li className="flex items-center gap-4 border-b border-green-200 px-5 py-4 last:border-b-0">
      <Avatar username={friend.username} online={online} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-green-800">
          {friend.name}
        </p>
        <p className="truncate text-xs text-green-500">
          {online
            ? 'En ligne'
            : lastSeenAt
              ? formatLastSeen(lastSeenAt)
              : `@${friend.username}`}
        </p>
      </div>
      <button
        type="button"
        onClick={onMessage}
        aria-label={`Envoyer un message à ${friend.username}`}
        className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-green-600"
      >
        <MessageCircle className="h-4 w-4" />
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

function formatLastSeen(lastSeenAt: string): string {
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}
