import { useCallback, useEffect, useState, type ReactNode } from 'react';

import * as authApi from './api';
import type { AuthUser } from './api';
import { AuthContext, type AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    authApi
      .getMe()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  const login = useCallback(async (input: authApi.LoginInput) => {
    const me = await authApi.login(input);
    setUser(me);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: authApi.RegisterInput) => {
    const me = await authApi.register(input);
    setUser(me);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateUser = useCallback((partial: Partial<authApi.AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
