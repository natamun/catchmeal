import { Weight } from 'lucide-react';

export default function WeightCard({
  title,
  value,
  unit,
  average,
}: {
  title: string;
  value: number | string;
  unit: string;
  average?: number | null;
}) {
  let printAverage = '';
  if (average !== null && average !== undefined) {
    printAverage =
      average > 0 ? '+' + average?.toString() : average?.toString();
  }
  return (
    <div className="flex rounded-2xl border border-green-200 bg-white shadow-sm">
      <object className="m-2 flex items-center justify-center rounded-2xl bg-green-100 p-3">
        <Weight size={25} />
      </object>
      <div className="flex justify-center">
        <div>
          <p className="ml-2 text-xs font-semibold uppercase">{title}</p>
          <p className="mt-1 ml-2 text-3xl font-bold text-green-500">
            {value}
            <span className="ml-1 font-mono text-lg text-green-400">
              {unit}
            </span>
          </p>
        </div>
        {average !== null && (
          <div className="mt-2">
            <span className="ml-1 font-mono text-lg text-green-400">
              {printAverage}kg
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
