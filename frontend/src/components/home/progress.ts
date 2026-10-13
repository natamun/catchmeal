export function progressLaps(value: number, goal: number) {
  const ratio = goal > 0 ? value / goal : 0;

  return {
    lap: Math.min(ratio, 1),
    extraLap: Math.min(Math.max(ratio - 1, 0), 1),
  };
}
