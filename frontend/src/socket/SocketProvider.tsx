import { useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useAuth } from '../auth/authContext';
import { SocketContext } from './socketContext';

/**
 * Opens one socket.io connection once the user is logged in and closes it on
 * logout. The browser sends the session cookie with it, and the backend reads
 * it to know who is connected.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Without VITE_SOCKET_URL the socket connects to the page's own origin; in
    // production Caddy forwards /socket.io to the backend.
    const instance = io(import.meta.env.VITE_SOCKET_URL || undefined, {
      withCredentials: true,
      // Close the socket before the page unloads, otherwise Firefox logs an
      // "interrupted connection" error on every reload.
      closeOnBeforeunload: true,
    });
    instance.on('connect', () => {
      setIsConnected(true);
      setHasConnectedOnce(true);
    });
    instance.on('disconnect', () => setIsConnected(false));
    // One-time setState to expose the newly created socket handle to consumers —
    // not a cascading update, this effect only re-runs when `status` changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
      setIsConnected(false);
      setHasConnectedOnce(false);
    };
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, hasConnectedOnce }}>
      {children}
    </SocketContext.Provider>
  );
}
