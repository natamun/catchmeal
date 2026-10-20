import { JSON_HEADERS, request } from '../../utils/request';
import type { ResponseMistral } from './types';

const BASE_URL = import.meta.env.VITE_API_URL;

export function askAssistant(userId: number, message: string) {
  return request<ResponseMistral>(`${BASE_URL}/users/${userId}/chat`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ message }),
  });
}
