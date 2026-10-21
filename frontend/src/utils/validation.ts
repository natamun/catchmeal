/** Length limits shared by the forms, the same as the backend DTOs. */
export const MIN_LENGTH = { username: 3, password: 8 } as const;

export const MAX_LENGTH = {
  username: 30,
  name: 80,
  email: 255,
  password: 72,
  foodName: 120,
  brand: 80,
  mealName: 120,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export function minLengthMessage(min: number) {
  return `${min} caractères minimum`;
}

export function maxLengthMessage(max: number) {
  return `${max} caractères maximum`;
}

/**
 * Error message for a username, or undefined when it is valid. Spaces around it
 * are ignored, as on the backend.
 */
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

/**
 * Quick check before sending (something@domain.xx, 255 characters at most); the
 * backend validates the email again.
 */
export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email) && email.length <= MAX_LENGTH.email;
}
