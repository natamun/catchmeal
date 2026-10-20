import { JSON_HEADERS, request } from '../../utils/request';

const BASE_URL = import.meta.env.VITE_API_URL;

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
  createAt: string;
  deletedAt: string | null;
  lastSeenAt: string | null;
  hasPassword: boolean;
  oauthProvider?: string | null;
  onlineStatus: boolean;
  _count?: { userFriend: number };
}

export interface AdminStats {
  totalUsers: number;
  totalMeals: number;
  totalFoodItems: number;
}

export function getUserById(id: number) {
  return request<AdminUser | null>(`${BASE_URL}/admin/users/${id}`);
}

export function getUsers() {
  return request<AdminUser[]>(`${BASE_URL}/admin/users`);
}

export function getStats() {
  return request<AdminStats>(`${BASE_URL}/admin/stats`);
}

export interface AdminUserChanges {
  role?: AdminUser['role'];
  username?: string;
}

export function updateUser(id: number, changes: AdminUserChanges) {
  return request<Pick<AdminUser, 'id' | 'username' | 'role'>>(
    `${BASE_URL}/admin/users/${id}`,
    {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(changes),
    },
  );
}

export function deleteUser(id: number) {
  return request<AdminUser>(`${BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
  });
}
