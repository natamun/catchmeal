import { X } from 'lucide-react';

import { formatRelativeTime } from '../../utils/formatRelativeTime';
import type { ActivityItem } from '../friends/types';

type Variant = 'composer' | 'sent' | 'received';

const VARIANT_CLASS: Record<Variant, string> = {
  composer: 'border-green-400 bg-green-50 text-green-800',
  sent: 'border-white/70 bg-white/15 text-white',
  received: 'border-green-400 bg-green-50 text-green-800',
};

interface QuotedActivityProps {
  activity: ActivityItem;
  variant: Variant;
  onDismiss?: () => void;
}

export function QuotedActivity({
  activity,
  variant,
  onDismiss,
}: QuotedActivityProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border-l-4 px-3 py-2 text-xs ${VARIANT_CLASS[variant]}`}
    >
      <div className="min-w-0 flex-1">
        <p className="wrap-break-word">
          <span className="font-semibold">{activity.user.username}</span>{' '}
          {activity.message}
        </p>
        <p className="opacity-70">{formatRelativeTime(activity.createdAt)}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Retirer la citation"
          className="shrink-0 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
