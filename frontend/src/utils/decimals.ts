export const MAX_DECIMALS = 2;

export const TOO_MANY_DECIMALS = `${MAX_DECIMALS} décimales maximum`;

export const WHOLE_NUMBER_ONLY = 'Nombre entier';

export function parseDecimal(text: string) {
  const trimmed = text.trim();
  return trimmed === '' ? null : Number(trimmed.replace(',', '.'));
}

export function roundDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function hasTooManyDecimals(text: string) {
  const decimals = text.trim().split(/[.,]/)[1] ?? '';
  return decimals.length > MAX_DECIMALS;
}
