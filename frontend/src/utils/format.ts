/** A number written the French way, with at most one decimal: 72,5. */
export function formatKg(value: number) {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}

/** A date such as "Lundi 20 octobre", capitalized. */
export function formatWeekday(date: Date) {
  const day = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return day.charAt(0).toUpperCase() + day.slice(1);
}

/** A date such as "20 octobre". */
export function formatDayMonth(date: Date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
