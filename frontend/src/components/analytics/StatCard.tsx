import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  title,
  value,
  unit,
  Icon,
}: {
  title: string;
  value: number | string;
  unit: string;
  Icon?: LucideIcon;
}) {
  return (
    <div className="flex rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="m-2 flex items-center justify-center rounded-2xl bg-green-100 p-3">
        {Icon && <Icon size={25} aria-hidden="true" />}
      </div>
      <div className="flex flex-col justify-center">
        <p className="ml-2 text-xs font-semibold uppercase">{title}</p>
        <p className="mt-1 ml-2 text-3xl font-bold text-green-500">
          {value}
          <span className="ml-1 font-mono text-lg text-green-400">{unit}</span>
        </p>
      </div>
    </div>
  );
}
