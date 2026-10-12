import { formatKg } from '../../utils/format';

export const COMPOSITION = [
  {
    key: 'bodyFat',
    label: 'Masse grasse',
    unit: '%',
    min: 1,
    max: 100,
    example: '18',
  },
  {
    key: 'fatFreeMass',
    label: 'Masse maigre',
    unit: 'kg',
    min: 1,
    max: 300,
    example: '59,5',
  },
  {
    key: 'bodyWater',
    label: 'Eau',
    unit: '%',
    min: 1,
    max: 100,
    example: '58',
  },
  {
    key: 'muscleMass',
    label: 'Muscle',
    unit: 'kg',
    min: 1,
    max: 300,
    example: '56,5',
  },
] as const;

export const MEASURES = [
  {
    key: 'weight',
    label: 'Poids',
    unit: 'kg',
    min: 20,
    max: 500,
    example: '72,5',
  },
  ...COMPOSITION,
] as const;

export type MeasureKey = (typeof MEASURES)[number]['key'];

export function formatMeasure(value: number | null, unit: string) {
  return value === null ? '–' : `${formatKg(value)}\u00a0${unit}`;
}
