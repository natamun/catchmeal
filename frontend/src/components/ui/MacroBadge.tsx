interface MacroBadgeProps {
  label: string;
  value: number;
  color: string;
}

/** A colored dot and a number of grams; the full label shows on hover. */
export function MacroBadge({ label, value, color }: MacroBadgeProps) {
  return (
    <span
      title={`${label} : ${value}g`}
      aria-label={`${label} : ${value}g`}
      className="flex items-center gap-1 text-xs font-semibold text-green-700"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${color}`} />
      <span aria-hidden="true">{value}</span>
    </span>
  );
}
