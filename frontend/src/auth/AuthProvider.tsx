import { useCallback, useEffect, useState, type ReactNode } from 'react';

import * as authApi from './api';
import type { AuthUser } from './api';
import {
  AuthContext,
  type AuthStatus,
  type RegisterOutcome,
} from './authContext';

/**
 * Holds the session for the whole app. It asks /auth/me once when the app
 * starts, then keeps the user up to date after login, register, logout and
 * profile edits (updateUser).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    authApi
      .getMe()
      .then((me) => {
        setUser(me);
        setStatus(me ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  const login = useCallback(async (input: authApi.LoginInput) => {
    const me = await authApi.login(input);
    setUser(me);
    setLoggedOut(false);
    setStatus('authenticated');
  }, []);

  const register = useCallback(
    async (input: authApi.RegisterInput): Promise<RegisterOutcome> => {
      const me = await authApi.register(input);
      if (authApi.isPendingVerification(me)) {
        return 'verification-required';
      }
      setUser(me);
      setLoggedOut(false);
      setStatus('authenticated');
      return 'signed-in';
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setLoggedOut(true);
    setStatus('unauthenticated');
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, loggedOut, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
