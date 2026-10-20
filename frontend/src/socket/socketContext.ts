import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  hasConnectedOnce: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  hasConnectedOnce: false,
});

export function useSocket() {
  return useContext(SocketContext);
}
