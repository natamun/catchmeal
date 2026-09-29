import { useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useAuth } from '../auth/auth-context';
import { SocketContext } from './socket-context';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const instance = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });
    instance.on('connect', () => setIsConnected(true));
    instance.on('disconnect', () => setIsConnected(false));
    // One-time setState to expose the newly created socket handle to consumers —
    // not a cascading update, this effect only re-runs when `status` changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
