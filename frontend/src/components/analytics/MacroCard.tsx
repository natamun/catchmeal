export default function MacroCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number | string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-green-200 bg-white p-1 shadow-sm">
      <p className="m-1.5 text-xs font-semibold md:ml-3">{title}</p>
      <p className="m-1.5 text-xl font-bold text-green-500 md:ml-3">
        {value}
        <span className="ml-1 font-mono text-xs text-green-400">{unit}</span>
      </p>
    </div>
  );
}
