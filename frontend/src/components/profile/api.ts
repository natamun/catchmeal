import { JSON_HEADERS, request } from '../../utils/request';

const BASE_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  height: number | null;
  targetWeight: number | null;
  dailyCalorieGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
  gender: string | null;
  birthDate: string | null;
  activityLevel: string | null;
  bodyFat: number | null;
  fatFreeMass: number | null;
  bodyWater: number | null;
  muscleMass: number | null;
}

export interface UpdateProfileInput {
  username?: string;
  name?: string;
  height?: number;
  targetWeight?: number;
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbsGoal?: number;
  dailyFatGoal?: number;
  gender?: string;
  birthDate?: string;
  activityLevel?: string;
  bodyFat?: number;
  fatFreeMass?: number;
  bodyWater?: number;
  muscleMass?: number;
}

export interface WeightEntry {
  id: number;
  weight: number;
  bodyFat: number | null;
  fatFreeMass: number | null;
  bodyWater: number | null;
  muscleMass: number | null;
  loggedAt: string;
}

export interface LogWeightInput {
  weight: number;
  bodyFat: number | null;
  fatFreeMass: number | null;
  bodyWater: number | null;
  muscleMass: number | null;
}

export interface DataExport {
  exportedAt: string;
  data: {
    profile: {
      id: number;
      username: string;
      name: string;
      email: string;
      role: string;
      createAt: string;
      meal: unknown[];
      weightLogs: unknown[];
      goalSettings: unknown[];
      senderMessage: unknown[];
      receiverMessage: unknown[];
    };
  };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function exportMyData() {
  return request<DataExport>(`${BASE_URL}/gdpr/export`);
}

export function deleteMyAccount() {
  return request<{ message: string }>(`${BASE_URL}/gdpr/account`, {
    method: 'DELETE',
  });
}

export function changePassword(input: ChangePasswordInput) {
  return request<{ success: boolean }>(`${BASE_URL}/auth/password`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function uploadAvatar(userId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return request<UserProfile>(`${BASE_URL}/users/${userId}/avatar`, {
    method: 'PATCH',
    body: form,
  });
}

export function removeAvatar(userId: number) {
  return request<UserProfile>(`${BASE_URL}/users/${userId}/avatar`, {
    method: 'DELETE',
  });
}

export function updateProfile(userId: number, input: UpdateProfileInput) {
  return request<UserProfile>(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function updateWeight(
  userId: number,
  entryId: number,
  input: LogWeightInput,
) {
  return request<WeightEntry>(`${BASE_URL}/users/${userId}/weight/${entryId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

// TODO: wire to the backend, DELETE /users/:userId/weight/:entryId does not exist yet
export function deleteWeight(userId: number, entryId: number) {
  return request<WeightEntry>(`${BASE_URL}/users/${userId}/weight/${entryId}`, {
    method: 'DELETE',
  });
}

export function logWeight(userId: number, input: LogWeightInput) {
  return request<WeightEntry>(`${BASE_URL}/users/${userId}/weight`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function getWeightHistory(userId: number, signal?: AbortSignal) {
  return request<WeightEntry[]>(`${BASE_URL}/users/${userId}/weight`, {
    signal,
  });
}
