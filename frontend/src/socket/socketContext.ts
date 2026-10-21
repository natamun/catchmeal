import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

/**
 * The live connection shared by the chat, presence, friends and activity hooks.
 */
export interface SocketContextValue {
  socket: Socket | null;
  /** False while the connection is down; the app shows a warning meanwhile. */
  isConnected: boolean;
  /**
   * Becomes true at the first successful connection, so the warning is not
   * shown while the very first connection is still being made.
   */
  hasConnectedOnce: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  hasConnectedOnce: false,
});

/** Gives the shared socket. It is null while nobody is logged in. */
export function useSocket() {
  return useContext(SocketContext);
}
