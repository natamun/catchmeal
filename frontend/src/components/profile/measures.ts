import { formatKg } from '../../utils/format';

export const COMPOSITION = [
  { key: 'bodyFat', label: 'Masse grasse', unit: '%', min: 1, max: 100 },
  { key: 'fatFreeMass', label: 'Masse maigre', unit: 'kg', min: 1, max: 300 },
  { key: 'bodyWater', label: 'Eau', unit: '%', min: 1, max: 100 },
  { key: 'muscleMass', label: 'Muscle', unit: 'kg', min: 1, max: 300 },
] as const;

export const MEASURES = [
  { key: 'weight', label: 'Poids', unit: 'kg', min: 20, max: 500 },
  ...COMPOSITION,
] as const;

export type MeasureKey = (typeof MEASURES)[number]['key'];

export function formatMeasure(value: number | null, unit: string) {
  return value === null ? '–' : `${formatKg(value)} ${unit}`;
}
