import { useEffect, useState } from 'react';

import { getConversation } from '../components/messages/api';
import type { Message } from '../components/messages/types';

const POLL_INTERVAL_MS = 3000;

export function useConversation(userId: number, otherUserId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoaderror] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const fetched = await getConversation(userId, otherUserId);
        if (cancelled) return;
        setMessages(fetched);
        setLoaderror(null);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setLoaderror('Impossible de charger la conversation.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [userId, otherUserId]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  return { messages, isLoading, loadError, addMessage };
}
