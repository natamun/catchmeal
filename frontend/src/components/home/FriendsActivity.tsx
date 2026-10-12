import { MessageCircle } from 'lucide-react';

import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { Avatar } from '../friends/Avatar';
import type { ActivityItem, FriendPresence } from '../friends/types';
import { ListCard } from '../ui/ListCard';

interface FriendsActivityProps {
  activities: ActivityItem[];
  presence: Map<number, FriendPresence>;
  onReply: (activity: ActivityItem) => void;
}

export default function FriendsActivity({
  activities,
  presence,
  onReply,
}: FriendsActivityProps) {
  return (
    <ListCard>
      <h2 className="px-5 pt-5 pb-3 text-sm font-semibold tracking-wide text-green-500 uppercase">
        Activité des amis
      </h2>
      {activities.length === 0 ? (
        <p className="px-5 pt-1 pb-6 text-center text-sm text-green-500">
          Aucune activité récente
        </p>
      ) : (
        <ul className="flex flex-col" aria-label="Activité des amis">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 border-b border-green-200 px-5 py-4 last:border-b-0"
            >
              <Avatar
                username={a.user.username}
                online={presence.get(a.user.id)?.online ?? false}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">{a.user.username}</span>{' '}
                  {a.message}
                </p>
                <p className="text-xs text-green-500">
                  {formatRelativeTime(a.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onReply(a)}
                aria-label={`Répondre à ${a.user.username}`}
                className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-green-600"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </ListCard>
  );
}
