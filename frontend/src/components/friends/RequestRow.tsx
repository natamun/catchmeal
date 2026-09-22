import { X } from 'lucide-react';

import { Avatar } from './Avatar';
import type { UserSummary } from './types';

interface RequestRowProps {
  from: UserSummary;
  isBusy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function RequestRow({
  from,
  isBusy,
  onAccept,
  onDecline,
}: RequestRowProps) {
  return (
    <li className="flex items-center gap-3 border-b border-green-200 px-5 py-4 last:border-b-0">
      <Avatar username={from.username} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-green-800">
          {from.name}
        </p>
        <p className="truncate text-xs text-green-500">@{from.username}</p>
      </div>
      <button
        type="button"
        onClick={onAccept}
        disabled={isBusy}
        className="shrink-0 cursor-pointer rounded-xl bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Accepter
      </button>
      <button
        type="button"
        onClick={onDecline}
        disabled={isBusy}
        aria-label={`Refuser ${from.username}`}
        className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}
