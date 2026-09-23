interface Props {
  current: number;
  target: number;
  start?: number;
}

export function WeightProgressBar({ current, target, start }: Props) {
  const origin = start ?? (current > target ? current + 10 : current - 10);
  const total = Math.abs(origin - target);
  const done = Math.abs(origin - current);
  const pct = Math.min(100, Math.round((done / total) * 100));
  const losing = origin > target;

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-green-400">
        <span>{current} kg</span>
        <span>objectif {target} kg · {pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-100">
        <div
          className={`h-full rounded-full transition-all ${losing ? 'bg-green-400' : 'bg-blue-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
