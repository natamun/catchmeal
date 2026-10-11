export function formatKg(value: number) {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}
