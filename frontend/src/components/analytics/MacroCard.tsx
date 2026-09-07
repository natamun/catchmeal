export default function MacroCard({title, value, unit}: {title: string, value: number | string, unit: string}) {
  return (
    <div className="bg-white rounded-2xl p-2 border border-green-100 shadow-sm hover:shadow-md">
      <p className="text-xs text-green-500 uppercase">{title}</p>
      <p className="text-xl font-bold text-green-600 mt-0.5">
        {value}
        <span className="text-xs font-mono text-green-300 ml-1">{unit}</span>
      </p>
    </div>
  );
}