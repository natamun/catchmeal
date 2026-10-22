import { JSON_HEADERS, request } from '../utils/request';

const AUTH_URL = `${import.meta.env.VITE_API_URL}/auth`;

/** The `code` the backend sends when an unconfirmed account tries to sign in. */
export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED';

/** The logged-in user, as /auth/me, login and register return it. */
export interface AuthUser {
  userId: number;
  username: string;
  email?: string;
  role?: string;
  name?: string;
  avatarUrl?: string | null;
  height?: number | null;
  targetWeight?: number | null;
  dailyCalorieGoal?: number | null;
  dailyProteinGoal?: number | null;
  dailyCarbsGoal?: number | null;
  dailyFatGoal?: number | null;
  gender?: string | null;
  birthDate?: string | null;
  activityLevel?: string | null;
  hasPassword?: boolean;
  emailVerified?: boolean;
}

export interface RegisterInput {
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

/** What register answers when the email must be confirmed before signing in. */
export interface PendingVerification {
  requiresVerification: true;
}

export function isPendingVerification(
  result: AuthUser | PendingVerification,
): result is PendingVerification {
  return 'requiresVerification' in result;
}

/**
 * POST /auth/register: creates the account. The backend also sets the session
 * cookie, so the user is logged in right away.
 */
export function register(input: RegisterInput) {
  return request<AuthUser | PendingVerification>(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/**
 * POST /auth/login: checks the credentials. On success the backend sets the
 * session cookie (httpOnly, so JavaScript never sees the token).
 */
export function login(input: LoginInput) {
  return request<AuthUser>(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** POST /auth/logout: the backend clears the session cookie. */
export function logout() {
  return request<{ success: boolean }>(`${AUTH_URL}/logout`, {
    method: 'POST',
  });
}

/**
 * GET /auth/me: resolves to the logged-in user, or null when nobody is logged
 * in. The backend answers 200 in both cases so the browser console stays clean.
 */
export function getMe() {
  return request<{ user: AuthUser | null }>(`${AUTH_URL}/me`).then(
    ({ user }) => user,
  );
}

export interface CompleteOAuthProfileInput {
  username: string;
  name: string;
  email: string;
}

/**
 * PATCH /auth/complete-profile: saves the username, name and email that a new
 * OAuth user picks on the welcome page.
 */
export function completeOAuthProfile(input: CompleteOAuthProfileInput) {
  return request<AuthUser>(`${AUTH_URL}/complete-profile`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** POST /auth/verify-email: confirms the address with the token from the email link. */
export function verifyEmail(token: string) {
  return request<{ verified: boolean }>(`${AUTH_URL}/verify-email`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ token }),
  });
}

/**
 * POST /auth/resend-verification: asks for a new link. The backend answers the
 * same way whether or not the address has an account.
 */
export function resendVerification(email: string) {
  return request<{ success: boolean }>(`${AUTH_URL}/resend-verification`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });
}
