const ALLOWED_FRONTEND_URL =
  process.env.FRONTEND_URL ?? 'http://localhost:5173';

/** URL of the frontend, always on our own origin (never on a user-supplied one). */
export function safeRedirectUrl(path: string = ''): string {
  try {
    const base = new URL(ALLOWED_FRONTEND_URL);
    return `${base.origin}${path}`;
  } catch {
    return `http://localhost:5173${path}`;
  }
}
