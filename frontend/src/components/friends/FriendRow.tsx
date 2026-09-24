import { X } from 'lucide-react';

import { Avatar } from './Avatar';
import type { UserSummary } from './types';

interface FriendRowProps {
  friend: UserSummary;
  onRemove: () => void;
}

export default function FriendRow({ friend, onRemove }: FriendRowProps) {
  return (
    <li className="flex items-center gap-4 border-b border-green-200 px-5 py-4 last:border-b-0">
      <Avatar username={friend.username} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-green-800">
          {friend.name}
        </p>
        <p className="truncate text-xs text-green-500">@{friend.username}</p>
      </div>
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
