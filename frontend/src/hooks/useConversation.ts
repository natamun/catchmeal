import { useEffect, useState } from 'react';

import { getConversation } from '../components/messages/api';
import type { Message } from '../components/messages/types';
import { useSocket } from '../socket/socketContext';

/**
 * One chat conversation: loads the history, appends the new messages pushed by
 * the socket and reloads after a reconnection. `send` goes through the socket
 * and waits for the server's acknowledgement: the saved message, or { error }.
 */
export function useConversation(userId: number, otherUserId: number) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = () => {
      getConversation(userId, otherUserId)
        .then((fetched) => {
          if (!cancelled) setMessages(fetched);
        })
        .catch(() => {
          if (!cancelled) {
            setLoadError('Impossible de charger la conversation.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    loadHistory();

    if (!socket)
      return () => {
        cancelled = true;
      };

    const handleNewMessage = (message: Message) => {
      const isRelevant =
        (message.senderId === userId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === userId);
      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
    };
    const handleReconnect = () => loadHistory();

    socket.on('message:new', handleNewMessage);
    socket.io.on('reconnect', handleReconnect);

    return () => {
      cancelled = true;
      socket.off('message:new', handleNewMessage);
      socket.io.off('reconnect', handleReconnect);
    };
  }, [socket, userId, otherUserId]);

  const send = (content: string, activityId?: number) => {
    return new Promise<Message>((resolve, reject) => {
      socket?.emit(
        'message:send',
        { toUserId: otherUserId, content, activityId },
        (response: Message | { error: string }) => {
          if ('error' in response) reject(new Error(response.error));
          else resolve(response);
        },
      );
    });
  };

  return { messages, isLoading, loadError, send, isConnected };
}
