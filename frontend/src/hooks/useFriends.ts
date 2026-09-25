import { useEffect, useState } from 'react';

import {
  ApiError,
  listFriends,
  listPendingRequests,
  listSentRequests,
} from '../components/friends/api';
import type { Friend, FriendRequest } from '../components/friends/types';

export function useFriends(userId: number) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

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
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 403) return;
        console.error(err);
        setLoadError('Impossible de charger tes amis, réessaye.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [userId, reloadCount]);

  return {
    friends,
    requests,
    sentRequestIds,
    isLoading,
    loadError,
    reload: () => setReloadCount((count) => count + 1),
  };
}
