const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

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

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  birthDate: string,
  gender: string,
): number {
  const age = getAge(birthDate);
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') return Math.round(base + 5);
  if (gender === 'FEMALE') return Math.round(base - 161);
  return Math.round(base - 78);
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}
