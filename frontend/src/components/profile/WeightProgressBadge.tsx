interface Props {
  current: number;
  target: number;
}

export function WeightProgressBadge({ current, target }: Props) {
  const diff = current - target;
  const losing = diff > 0;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-600">
      {losing ? '↓' : '↑'} {Math.abs(diff).toFixed(1)} kg {losing ? 'à perdre' : 'à prendre'}
    </span>
  );
}
