import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { getConversation } from '../components/messages/api';
import type { Message } from '../components/messages/types';

export function useConversation(userId: number, otherUserId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = () => {
      getConversation(userId, otherUserId)
        .then((fetched) => {
          if (!cancelled) setMessages(fetched);
        })
        .catch((err) => {
          if (!cancelled) {
            console.error(err);
            setLoadError('Impossible de charger la conversation.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    loadHistory();

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('message:new', (message: Message) => {
      const isRelevant =
        (message.senderId === userId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === userId);
      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.io.on('reconnect', () => {
      setIsConnected(true);
      loadHistory();
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [userId, otherUserId]);

  const send = (content: string) => {
    return new Promise<Message>((resolve, reject) => {
      socketRef.current?.emit(
        'message:send',
        { toUserId: otherUserId, content },
        (response: Message | { error: string }) => {
          if ('error' in response) reject(new Error(response.error));
          else resolve(response);
        },
      );
    });
  };

  return { messages, isLoading, loadError, send, isConnected };
}
