const AUTH_URL = `${import.meta.env.VITE_API_URL}/auth`;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = body?.message;
  return Array.isArray(message)
    ? message.join(', ')
    : (message ?? `HTTP ${response.status}`);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response));
  }
  return (await response.json()) as T;
}

export interface AuthUser {
  userId: number;
  username: string;
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
  return request<AuthUser>(`${AUTH_URL}/me`);
}
