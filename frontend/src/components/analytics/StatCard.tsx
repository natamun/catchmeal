export default function StatCard({
  title,
  value,
  unit,
  img,
}: {
  title: string;
  value: number | string;
  unit: string;
  img?: string;
}) {
  return (
    <div className="flex rounded-2xl border border-green-100 bg-white p-2 shadow-sm hover:shadow-md">
      <object className="m-2 flex items-center justify-center rounded-2xl bg-green-100 p-3">
        {img && <img className="h-5 w-5" src={img} alt="" />}
      </object>
      <div className="flex flex-col justify-center">
        <p className="ml-2 text-xs font-semibold text-green-500 uppercase">
          {title}
        </p>
        <p className="mt-1 ml-2 text-3xl font-bold text-green-600">
          {value}
          <span className="ml-1 font-mono text-lg text-green-300">{unit}</span>
        </p>
      </div>
    </div>
  );
}
