import { useEffect, useState } from 'react';

import {
  listFriends,
  listPendingRequests,
  listSentRequests,
} from '../components/friends/api';
import type { Friend, FriendRequest } from '../components/friends/types';
import { useSocket } from '../socket/socketContext';

/**
 * Friends, received requests and sent requests, loaded together and reloaded
 * whenever the socket announces a change (new request, acceptance, removal) or
 * reconnects.
 */
export function useFriends(userId: number) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listFriends(userId, controller.signal),
      listPendingRequests(userId, controller.signal),
      listSentRequests(userId, controller.signal),
    ])
      .then(([loadedFriends, loadedRequests, loadedSentIds]) => {
        setFriends(loadedFriends);
        setRequests(loadedRequests);
        setSentRequestIds(loadedSentIds);
        setLoadError(null);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoadError('Impossible de charger les amis.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [userId, reloadCount]);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => setReloadCount((count) => count + 1);

    socket.on('friend:request', refresh);
    socket.on('friend:accepted', refresh);
    socket.on('friend:removed', refresh);
    socket.io.on('reconnect', refresh);

    return () => {
      socket.off('friend:request', refresh);
      socket.off('friend:accepted', refresh);
      socket.off('friend:removed', refresh);
      socket.io.off('reconnect', refresh);
    };
  }, [socket]);

  return {
    friends,
    requests,
    sentRequestIds,
    isLoading,
    loadError,
    reload: () => setReloadCount((count) => count + 1),
    retry: () => {
      setLoadError(null);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    },
  };
}
