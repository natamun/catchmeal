import { JSON_HEADERS, request } from '../../utils/request';

const BASE_URL = import.meta.env.VITE_API_URL;

/** The profile as the users routes return it. */
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
}

/**
 * Fields to change in the profile; the fields left out stay as they are, and
 * null clears a measure or a goal.
 */
export interface UpdateProfileInput {
  username?: string;
  name?: string;
  height?: number | null;
  targetWeight?: number | null;
  dailyCalorieGoal?: number | null;
  dailyProteinGoal?: number | null;
  dailyCarbsGoal?: number | null;
  dailyFatGoal?: number | null;
  gender?: string;
  birthDate?: string;
  activityLevel?: string;
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

interface ExportMeal {
  name: string | null;
  typeMeal: string | null;
  loggedAt: string | null;
  items: { kcal: number; protein: number; carbs: number; fat: number }[];
}

interface ExportFoodItem {
  name: string;
  brand: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ExportWeightLog {
  weight: number;
  bodyFat: number | null;
  fatFreeMass: number | null;
  bodyWater: number | null;
  muscleMass: number | null;
  loggedAt: string;
}

interface ExportGoalSetting {
  startDate: string;
  dailyCalories: number;
  dailyProtein: number | null;
  dailyCarbs: number | null;
  dailyFat: number | null;
  objective: string | null;
}

interface ExportMessage {
  content: string;
  sentAt: string;
  readAt: string | null;
}

interface ExportActivity {
  type: string;
  createdAt: string;
  metadata: unknown;
}

interface ExportFriend {
  friendUser: { username: string; name: string };
  status: string;
  lastTimeConnected: string | null;
}

interface ExportProfile extends Omit<UserProfile, 'id'> {
  email: string;
  createAt: string;
  lastSeenAt: string | null;
  meal: ExportMeal[];
  foodItems: ExportFoodItem[];
  weightLogs: ExportWeightLog[];
  goalSettings: ExportGoalSetting[];
  senderMessage: ExportMessage[];
  receiverMessage: ExportMessage[];
  activities: ExportActivity[];
  userFriend: ExportFriend[];
}

/**
 * What GET /gdpr/export returns: the profile with everything linked to it
 * (meals, foods, weigh-ins, messages, friends, activities).
 */
export interface DataExport {
  exportedAt: string;
  data: { profile: ExportProfile };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * GET /gdpr/export: all the data of the user; GdprSection turns it into an HTML
 * or JSON file.
 */
export function exportMyData() {
  return request<DataExport>(`${BASE_URL}/gdpr/export`);
}

/**
 * DELETE /gdpr/account: anonymizes the account. The caller logs the user out
 * afterwards.
 */
export function deleteMyAccount() {
  return request<{ message: string }>(`${BASE_URL}/gdpr/account`, {
    method: 'DELETE',
  });
}

/**
 * PATCH /auth/password: needs the current password; the backend answers 400
 * when it is wrong.
 */
export function changePassword(input: ChangePasswordInput) {
  return request<{ success: boolean }>(`${BASE_URL}/auth/password`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/**
 * PATCH /users/:id/avatar: sends the image as multipart form data. No JSON
 * header here: the browser sets the multipart one itself.
 */
export function uploadAvatar(userId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return request<UserProfile>(`${BASE_URL}/users/${userId}/avatar`, {
    method: 'PATCH',
    body: form,
  });
}

/** DELETE /users/:id/avatar: removes the profile picture. */
export function removeAvatar(userId: number) {
  return request<UserProfile>(`${BASE_URL}/users/${userId}/avatar`, {
    method: 'DELETE',
  });
}

/** PATCH /users/:id: saves the profile fields that changed. */
export function updateProfile(userId: number, input: UpdateProfileInput) {
  return request<UserProfile>(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** PATCH /users/:id/weight/:entryId: corrects a weigh-in. */
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

/** DELETE /users/:id/weight/:entryId: deletes a weigh-in. */
export function deleteWeight(userId: number, entryId: number) {
  return request<WeightEntry>(`${BASE_URL}/users/${userId}/weight/${entryId}`, {
    method: 'DELETE',
  });
}

/** POST /users/:id/weight: records a new weigh-in, dated now by the backend. */
export function logWeight(userId: number, input: LogWeightInput) {
  return request<WeightEntry>(`${BASE_URL}/users/${userId}/weight`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** GET /users/:id/weight: every weigh-in of the user. */
export function getWeightHistory(userId: number, signal?: AbortSignal) {
  return request<WeightEntry[]>(`${BASE_URL}/users/${userId}/weight`, {
    signal,
  });
}
