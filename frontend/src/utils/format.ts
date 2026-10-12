export function formatKg(value: number) {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}

export function formatWeekday(date: Date) {
  const day = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return day.charAt(0).toUpperCase() + day.slice(1);
}

export function formatDayMonth(date: Date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
