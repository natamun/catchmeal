import { useEffect, useRef, useState } from 'react';

import {
  getUnreadSenderIds,
  markConversationRead,
} from '../components/messages/api';
import type { Message } from '../components/messages/types';
import { useSocket } from '../socket/socket-context';

export function useUnreadMessages(
  userId: number,
  openChatFriendId: number | null,
) {
  const { socket } = useSocket();
  const [unreadIds, setUnreadIds] = useState<Set<number>>(new Set());
  const openChatRef = useRef(openChatFriendId);

  useEffect(() => {
    openChatRef.current = openChatFriendId;
    if (openChatFriendId === null) return;

    markConversationRead(userId, openChatFriendId)
      .then(() =>
        setUnreadIds((prev) => {
          const next = new Set(prev);
          next.delete(openChatFriendId);
          return next;
        }),
      )
      .catch(console.error);
  }, [userId, openChatFriendId]);

  useEffect(() => {
    const load = () => {
      getUnreadSenderIds(userId)
        .then((ids) =>
          setUnreadIds(new Set(ids.filter((id) => id !== openChatRef.current))),
        )
        .catch(console.error);
    };

    load();

    if (!socket) return;

    const handleNew = (message: Message) => {
      if (message.receiverId !== userId) return;

      if (message.senderId === openChatRef.current) {
        markConversationRead(userId, message.senderId).catch(console.error);
        return;
      }
      setUnreadIds((prev) => new Set(prev).add(message.senderId));
    };

    socket.on('message:new', handleNew);
    socket.io.on('reconnect', load);

    return () => {
      socket.off('message:new', handleNew);
      socket.io.off('reconnect', load);
    };
  }, [socket, userId]);

  return unreadIds;
}
