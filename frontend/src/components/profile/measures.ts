import { formatKg } from '../../utils/format';

/**
 * The body composition values a weigh-in can include, with their allowed range
 * and the example shown as placeholder.
 */
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

/** Every value of a weigh-in: the weight, then the body composition. */
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

/** "72,5 kg" with a non-breaking space, or "–" when there is no value. */
export function formatMeasure(value: number | null, unit: string) {
  return value === null ? '–' : `${formatKg(value)}\u00a0${unit}`;
}
