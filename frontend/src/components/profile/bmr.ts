import type { WeightEntry } from './api';

/** Usual activity factors: daily needs = BMR x factor. */
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

/** Age in full years at today's date. */
function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  return hasBirthdayPassed ? age : age - 1;
}

/**
 * Fat-free mass of a weigh-in: the measured value, else deduced from the weight
 * and the body fat percentage (weight x (1 - fat / 100)). Null when neither is
 * known.
 */
export function fatFreeMassOf(
  entry: Pick<WeightEntry, 'weight' | 'bodyFat' | 'fatFreeMass'>,
): number | null {
  if (entry.fatFreeMass !== null) return entry.fatFreeMass;
  if (entry.bodyFat !== null) return entry.weight * (1 - entry.bodyFat / 100);
  return null;
}

/**
 * Basal metabolic rate: the calories burned per day at rest. With a fat-free
 * mass it uses the Katch-McArdle formula (370 + 21.6 x fat-free mass).
 * Otherwise Mifflin-St Jeor: +5 for men, -161 for women, -78 (halfway)
 * otherwise.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  birthDate: string,
  gender: string,
  fatFreeMass?: number | null,
): number {
  if (fatFreeMass) return Math.round(370 + 21.6 * fatFreeMass);
  const age = getAge(birthDate);
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') return Math.round(base + 5);
  if (gender === 'FEMALE') return Math.round(base - 161);
  return Math.round(base - 78);
}

/**
 * Total daily energy expenditure: the BMR times the activity factor (1.2 when
 * the level is unknown).
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}
