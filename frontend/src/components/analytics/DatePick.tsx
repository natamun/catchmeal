export default function DatePick({
  from,
  to,
  setFrom,
  setTo,
}: {
  from: string;
  to: string;
  setFrom: (date: string) => void;
  setTo: (date: string) => void;
}) {
  return (
    <div className="grid-cols-2 rounded-2xl border border-green-50 bg-white p-1 shadow-sm">
      <h3 className="md:text-md text-center font-semibold text-green-500 md:mb-3">
        Sélectionnez une date
      </h3>
      <div className="m-1 grid grid-cols-2 gap-3 text-center">
        <label className="text-xs text-green-600 md:grid md:grid-cols-2">
          <p className="p-0.5 text-xs font-semibold text-green-400 md:p-1 md:text-sm">
            Début
          </p>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target?.value)}
            className="rounded-lg bg-[#ECF8F6] px-2 py-1 shadow-sm hover:shadow-md"
            max={to}
            min={
              new Date(new Date().setDate(new Date().getDate() - 90))
                .toISOString()
                .split('T')[0]
            }
            required
          />
        </label>
        <label className="text-xs text-green-600 md:grid md:grid-cols-2">
          <p className="p-0.5 text-xs font-semibold text-green-400 md:p-1 md:text-sm">
            Fin
          </p>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target?.value)}
            className="rounded-lg bg-[#ECF8F6] px-2 py-1 shadow-sm hover:shadow-md"
            max={new Date().toISOString().split('T')[0]}
            min={from}
            required
          />
        </label>
      </div>
    </div>
  );
}
