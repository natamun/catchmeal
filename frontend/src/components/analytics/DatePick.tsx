import { Calendar } from 'lucide-react';

import setLastDays from '../../utils/SetLastDays';

const pillClass =
  'rounded-2xl bg-[#ECF8F6] px-2 py-1 text-center font-semibold shadow-[0_4px_0_0_#7FC8B8] transition-all duration-150 hover:brightness-95 active:translate-y-1 active:shadow-[0_1px_0_0_#7FC8B8]';

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
    <div className="flex flex-col flex-wrap rounded-2xl border border-green-200 bg-white shadow-sm lg:flex-row lg:items-center lg:gap-2">
      <div className="m-1 flex">
        <Calendar color="green" size={25} />
        <h3 className="ml-2 font-mono font-semibold sm:text-2xl md:text-3xl lg:text-4xl">
          Période
        </h3>
      </div>

      <div className="m-1 flex justify-center gap-2 font-mono text-xs font-semibold sm:text-sm">
        <label className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <p className="text-center">Début</p>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={pillClass}
            max={to}
            min={
              new Date(new Date().setDate(new Date().getDate() - 90))
                .toISOString()
                .split('T')[0]
            }
            required
          />
        </label>
        <label className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <p className="text-center">Fin</p>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={pillClass}
            max={new Date().toISOString().split('T')[0]}
            min={from}
            required
          />
        </label>
      </div>

      <div className="m-2 flex justify-center gap-3">
        <div>
          <button
            type="button"
            onClick={() => setLastDays(7, setFrom, setTo)}
            className={pillClass}
          >
            7 jours
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setLastDays(30, setFrom, setTo)}
            className={pillClass}
          >
            30 jours
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setLastDays(90, setFrom, setTo)}
            className={pillClass}
          >
            3 mois
          </button>
        </div>
      </div>
    </div>
  );
}
