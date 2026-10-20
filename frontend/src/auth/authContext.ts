import { createContext, useContext } from 'react';

import type { AuthUser, LoginInput, RegisterInput } from './api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  loggedOut: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error(
      'useCurrentUser must be used inside an authenticated route',
    );
  }
  return user;
}
