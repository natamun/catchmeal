/**
 * Splits a progress into a first lap (0 to 100% of the goal) and an extra lap
 * (the excess, at most one more lap), drawn in two colors.
 */
export function progressLaps(value: number, goal: number) {
  const ratio = goal > 0 ? value / goal : 0;

  return {
    lap: Math.min(ratio, 1),
    extraLap: Math.min(Math.max(ratio - 1, 0), 1),
  };
}
