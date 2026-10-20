export const MIN_LENGTH = { username: 3, password: 8 } as const;

export const MAX_LENGTH = {
  username: 30,
  name: 80,
  email: 255,
  password: 72,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export function minLengthMessage(min: number) {
  return `${min} caractères minimum`;
}

export function maxLengthMessage(max: number) {
  return `${max} caractères maximum`;
}

export function usernameError(username: string) {
  const { length } = username.trim();
  if (length < MIN_LENGTH.username) {
    return minLengthMessage(MIN_LENGTH.username);
  }
  if (length > MAX_LENGTH.username) {
    return maxLengthMessage(MAX_LENGTH.username);
  }
  return undefined;
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email) && email.length <= MAX_LENGTH.email;
}
