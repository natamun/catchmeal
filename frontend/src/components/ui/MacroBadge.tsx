interface MacroBadgeProps {
  label: string;
  value: number;
  color: string;
}

export function MacroBadge({ label, value, color }: MacroBadgeProps) {
  return (
    <span
      title={`${label} : ${value}g`}
      className="flex items-center gap-1 text-xs font-semibold text-green-700"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${color}`} />
      {value}
    </span>
  );
}
