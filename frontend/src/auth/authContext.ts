import { createContext, useContext } from 'react';

import type { AuthUser, LoginInput, RegisterInput } from './api';

/** 'loading' until /auth/me has answered, then whether a session exists. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Whether register signed the user in, or the email must be confirmed first. */
export type RegisterOutcome = 'signed-in' | 'verification-required';

/**
 * What useAuth() gives: the user, the session status and the actions that
 * change them.
 */
export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /**
   * True after an explicit logout: RequireAuth then goes to the landing page
   * instead of /login.
   */
  loggedOut: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterOutcome>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Reads the session from AuthProvider. Use it where the user may be missing
 * (public pages, guards); inside the app prefer useCurrentUser.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Returns the logged-in user in components rendered behind RequireAuth, where
 * it cannot be null. It throws if used anywhere else: that would be a coding
 * mistake, not a case a user can reach.
 */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error(
      'useCurrentUser must be used inside an authenticated route',
    );
  }
  return user;
}
