import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';

export function TooltipFrame({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-green-200 bg-white px-3 py-2 shadow-sm">
      <p className="mb-1 text-xs font-semibold text-green-600">{title}</p>
      {children}
    </div>
  );
}

export function TooltipRow({
  color,
  name,
  children,
}: {
  color?: string;
  name: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-green-600">{name}</span>
      <span className="ml-auto pl-4 font-semibold text-green-800 tabular-nums">
        {children}
      </span>
    </li>
  );
}

export function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || payload.length === 0) {
    return null;
  }

  return (
    <TooltipFrame title={label}>
      <ul className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <TooltipRow
            key={String(entry.dataKey)}
            color={entry.color}
            name={entry.name}
          >
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('fr-FR', { useGrouping: false })
              : entry.value}{' '}
            {entry.unit}
          </TooltipRow>
        ))}
      </ul>
    </TooltipFrame>
  );
}
