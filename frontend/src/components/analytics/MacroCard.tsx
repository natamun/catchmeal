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
    <div className="rounded-2xl border border-green-100 bg-white p-2 shadow-sm hover:shadow-md">
      <p className="text-xs text-green-500 uppercase">{title}</p>
      <p className="mt-0.5 text-xl font-bold text-green-600">
        {value}
        <span className="ml-1 font-mono text-xs text-green-300">{unit}</span>
      </p>
    </div>
  );
}
