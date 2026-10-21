import { useEffect, useState } from 'react';

import { getFriendsActivity } from '../components/friends/api';
import type { ActivityItem } from '../components/friends/types';
import { useSocket } from '../socket/socketContext';

/**
 * The friends activity feed: loaded once, then kept live by the socket (new
 * activities on top, edited ones replaced in place, deleted ones removed, full
 * reload after a reconnection). Keeps the 30 latest, like the backend.
 */
export function useActivityFeed(userId: number) {
  const { socket } = useSocket();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadActivities = () => {
      getFriendsActivity(userId)
        .then(setActivities)
        .catch(() => undefined);
    };

    loadActivities();

    if (!socket) return;

    const handleNew = (item: ActivityItem) => {
      setActivities((prev) => [item, ...prev].slice(0, 30));
    };
    const handleRemoved = ({ id }: { id: number }) => {
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    };
    const handleUpdated = (item: ActivityItem) => {
      setActivities((prev) =>
        prev.map((activity) => (activity.id === item.id ? item : activity)),
      );
    };
    const handleReconnect = () => loadActivities();

    socket.on('activity:new', handleNew);
    socket.on('activity:removed', handleRemoved);
    socket.on('activity:updated', handleUpdated);
    socket.io.on('reconnect', handleReconnect);

    return () => {
      socket.off('activity:new', handleNew);
      socket.off('activity:removed', handleRemoved);
      socket.off('activity:updated', handleUpdated);
      socket.io.off('reconnect', handleReconnect);
    };
  }, [socket, userId]);

  return activities;
}
