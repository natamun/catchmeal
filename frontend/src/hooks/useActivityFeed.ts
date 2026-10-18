import { useEffect, useState } from 'react';

import { getFriendsActivity } from '../components/friends/api';
import type { ActivityItem } from '../components/friends/types';
import { useSocket } from '../socket/socket-context';

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
    const handleReconnect = () => loadActivities();

    socket.on('activity:new', handleNew);
    socket.on('activity:removed', handleRemoved);
    socket.io.on('reconnect', handleReconnect);

    return () => {
      socket.off('activity:new', handleNew);
      socket.off('activity:removed', handleRemoved);
      socket.io.off('reconnect', handleReconnect);
    };
  }, [socket, userId]);

  return activities;
}
