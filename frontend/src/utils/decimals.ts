export const MAX_DECIMALS = 2;

export const TOO_MANY_DECIMALS = `${MAX_DECIMALS} décimales maximum`;

export function roundDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function hasTooManyDecimals(value: string) {
  const decimals = value.trim().split('.')[1] ?? '';
  return decimals.length > MAX_DECIMALS;
}
