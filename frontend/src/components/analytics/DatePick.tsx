import { Calendar } from 'lucide-react';

import setLastDays from '../../utils/SetLastDays';

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
    <div className="rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="m-1 flex">
        <Calendar color="green" size={25} />
        <h3 className="ml-2 font-mono font-semibold">Période</h3>
      </div>

      <div className="m-1 flex gap-3">
        <div>
          <label className="m-1 font-mono text-xs font-semibold">
            Début
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="transform rounded-2xl bg-[#ECF8F6] px-2 py-1 text-center font-semibold shadow-sm transition duration-300 hover:scale-110 hover:shadow-md"
              max={to}
              min={
                new Date(new Date().setDate(new Date().getDate() - 90))
                  .toISOString()
                  .split('T')[0]
              }
              required
            />
          </label>
        </div>
        <div>
          <label className="m-1 font-mono text-xs font-semibold">
            Fin
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="transform rounded-2xl bg-[#ECF8F6] px-2 py-1 text-center font-semibold shadow-sm transition duration-300 hover:scale-110 hover:shadow-md"
              max={new Date().toISOString().split('T')[0]}
              min={from}
              required
            />
          </label>
        </div>
      </div>

      <div className="m-2 flex justify-center gap-3">
        <div>
          <button
            type="button"
            onClick={() => setLastDays(7, setFrom, setTo)}
            className="transform rounded-2xl bg-[#ECF8F6] p-1.5 text-center font-semibold shadow-sm transition duration-300 hover:scale-110 hover:shadow-md"
          >
            7 jours
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setLastDays(30, setFrom, setTo)}
            className="transform rounded-2xl bg-[#ECF8F6] p-1.5 text-center font-semibold shadow-sm transition duration-300 hover:scale-110 hover:shadow-md"
          >
            30 jours
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setLastDays(90, setFrom, setTo)}
            className="transform rounded-2xl bg-[#ECF8F6] p-1.5 text-center font-semibold shadow-sm transition duration-300 hover:scale-110 hover:shadow-md"
          >
            3 mois
          </button>
        </div>
      </div>
    </div>
  );
}
