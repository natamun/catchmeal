/** Decimals allowed on every number: the backend refuses more. */
export const MAX_DECIMALS = 2;

export const TOO_MANY_DECIMALS = `${MAX_DECIMALS} décimales maximum`;

export const WHOLE_NUMBER_ONLY = 'Nombre entier';

/**
 * Reads a number typed by the user, with a comma or a dot. Returns null for an
 * empty field and NaN for text that is not a number.
 */
export function parseDecimal(text: string) {
  const trimmed = text.trim();
  return trimmed === '' ? null : Number(trimmed.replace(',', '.'));
}

/** Rounds `value` to `decimals` digits after the separator. */
export function roundDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Checks the typed text rather than the number, so "1,234" is refused before
 * anything is sent.
 */
export function hasTooManyDecimals(text: string) {
  const decimals = text.trim().split(/[.,]/)[1] ?? '';
  return decimals.length > MAX_DECIMALS;
}
