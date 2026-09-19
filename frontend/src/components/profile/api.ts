const BASE_URL = import.meta.env.VITE_API_URL;

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

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  username?: string;
  name?: string;
}

export function uploadAvatar(userId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return request<UserProfile>(`${BASE_URL}/users/${userId}/avatar`, {
    method: 'PATCH',
    body: form,
  });
}

export function updateProfile(userId: number, input: UpdateProfileInput) {
  return request<UserProfile>(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
