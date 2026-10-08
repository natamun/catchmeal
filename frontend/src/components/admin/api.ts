const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
  createAt: string;
  deletedAt: string | null;
  oauthProvider: string | null;
  onlineStatus: boolean;
  lastActivity: string | null;
  _count?: { userFriend: number };
}

export interface AdminStats {
  totalUsers: number;
  totalMeals: number;
  totalFoodItems: number;
}

export function getUsers() {
  return request<AdminUser[]>(`${BASE_URL}/admin/users`);
}

export function getStats() {
  return request<AdminStats>(`${BASE_URL}/admin/stats`);
}

export function updateUserRole(id: number, role: 'USER' | 'ADMIN') {
  return request<AdminUser>(`${BASE_URL}/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(id: number) {
  return request<AdminUser>(`${BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
  });
}
