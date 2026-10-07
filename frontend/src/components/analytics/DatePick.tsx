import { useState } from 'react';

import setLastDays from '../../utils/SetLastDays';
import { DatePickerButton } from './DatePickerButton';

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
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  return (
    <div className="flex flex-col flex-wrap justify-between rounded-2xl border border-green-200 bg-white shadow-sm lg:flex-row lg:items-center lg:gap-2">
      <div className="m-2 flex justify-center gap-2 font-mono text-xs font-semibold sm:text-sm md:m-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <p className="text-center">Début</p>
          <DatePickerButton
            date={from}
            setValue={(value) => {
              setFrom(value);
              setSelectedButton(null);
            }}
            min={
              new Date(new Date().setDate(new Date().getDate() - 90))
                .toISOString()
                .split('T')[0]
            }
            max={to}
            dateFormat="dd/MM/yy"
            placement="bottom-start"
          ></DatePickerButton>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <p className="text-center">Fin</p>
          <DatePickerButton
            date={to}
            setValue={(value) => {
              setTo(value);
              setSelectedButton(null);
            }}
            min={from}
            max={new Date().toISOString().split('T')[0]}
            dateFormat="dd/MM/yy"
            placement="bottom-end"
          ></DatePickerButton>
        </div>
      </div>

      <div className="m-1 flex flex-wrap justify-center gap-3">
        <div>
          {[7, 30, 90].map((d) => {
            const isActive = selectedButton === d;
            return (
              <button
                key={d}
                type="button"
                aria-label={`${d} derniers jours`}
                aria-pressed={isActive}
                onClick={() => {
                  setSelectedButton(d);
                  setLastDays(d, setFrom, setTo);
                }}
                className={`m-1 cursor-pointer rounded-full bg-green-50 px-5 py-1.5 text-sm font-semibold ring-1 ring-green-500 transition-all duration-200 ${isActive ? 'bg-green-600 text-white shadow-sm' : 'hover:bg-emerald-100/60'} `}
              >
                {`${d} j`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
