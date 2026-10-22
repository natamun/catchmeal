const ALLOWED_ORIGIN: string = import.meta.env.VITE_API_URL;

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Error thrown for any answer that is not 2xx. It keeps the HTTP status so the
 * caller can pick the right message (see requestErrorMessage).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Reads the NestJS error body and builds the ApiError. Its `message` is a string, or a list of strings
 * when several validation rules failed.
 */
async function parseError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
    code?: string;
  } | null;
  const message = body?.message;
  return new ApiError(
    Array.isArray(message)
      ? message.join(', ')
      : (message ?? `HTTP ${response.status}`),
    response.status,
    body?.code,
  );
}

/**
 * Sends a request to our backend with the session cookie and returns the parsed
 * JSON. Every api.ts goes through it.
 *
 * It refuses any URL outside VITE_API_URL, so it can only ever talk to our own
 * backend, and throws ApiError when the answer is not 2xx.
 */
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  if (!url.startsWith(ALLOWED_ORIGIN)) {
    throw new Error(`Blocked request to disallowed origin: ${url}`);
  }
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as T;
}
