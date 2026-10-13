import { JSON_HEADERS, request } from '../utils/request';

const AUTH_URL = `${import.meta.env.VITE_API_URL}/auth`;

export interface AuthUser {
  userId: number;
  username: string;
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

export function register(input: RegisterInput) {
  return request<AuthUser>(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return request<AuthUser>(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function logout() {
  return request<{ success: boolean }>(`${AUTH_URL}/logout`, {
    method: 'POST',
  });
}

export function getMe() {
  return request<{ user: AuthUser | null }>(`${AUTH_URL}/me`).then(
    ({ user }) => user,
  );
}
