import { useEffect, useState } from 'react';

import { getFriendsPresence } from '../components/friends/api';
import type { FriendPresence } from '../components/friends/types';
import { useSocket } from '../socket/socketContext';

export function usePresence(userId: number) {
  const { socket } = useSocket();
  const [presence, setPresence] = useState<Map<number, FriendPresence>>(
    new Map(),
  );

  useEffect(() => {
    const loadPresence = () => {
      getFriendsPresence()
        .then((list) => setPresence(new Map(list.map((p) => [p.userId, p]))))
        .catch(() => undefined);
    };

    loadPresence();

    if (!socket) return;

    const handleOnline = ({ userId: friendId }: { userId: number }) => {
      setPresence((prev) => {
        const next = new Map(prev);
        next.set(friendId, {
          userId: friendId,
          online: true,
          lastSeenAt: null,
        });
        return next;
      });
    };
    const handleOffline = ({
      userId: friendId,
      lastSeenAt,
    }: {
      userId: number;
      lastSeenAt: string;
    }) => {
      setPresence((prev) => {
        const next = new Map(prev);
        next.set(friendId, { userId: friendId, online: false, lastSeenAt });
        return next;
      });
    };
    const handleReconnect = () => loadPresence();

    socket.on('presence:online', handleOnline);
    socket.on('presence:offline', handleOffline);
    socket.io.on('reconnect', handleReconnect);

    return () => {
      socket.off('presence:online', handleOnline);
      socket.off('presence:offline', handleOffline);
      socket.io.off('reconnect', handleReconnect);
    };
  }, [socket, userId]);

  return presence;
}
