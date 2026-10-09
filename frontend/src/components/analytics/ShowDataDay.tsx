import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { DashboardDay } from '../../types/dashboard-analytics';
import { DatePickerButton } from './DatePickerButton';

function DownloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function ValidateJson({
  data,
  onError,
}: {
  data: DashboardDay[] | DashboardDay | undefined;
  onError: (x: boolean) => void;
}) {
  if (data === undefined || data === null) {
    onError(true);
    return;
  } else if (Array.isArray(data) && data.length === 0) {
    onError(true);
    return;
  }
  const dataExport = JSON.stringify(data, null, 2);
  onError(false);
  DownloadFile(dataExport, 'analytics.json', 'application/json');
  return;
}

export default function ShowDataDay({
  dashboard,
  from,
  to,
}: {
  dashboard: DashboardDay[];
  from: string;
  to: string;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(
    new Date().toISOString().split('T')[0],
  );
  const [error, setError] = useState(false);
  const printDay = dashboard.find((d) => d.day === selectedDay);
  const BUTTON_CLASS =
    'flex w-full cursor-pointer justify-between border-b hover:bg-gray-100 text-green-600 border-green-200 px-5 text-left text-sm transition-colors';

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => setError(false), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div>
      <div className="m-3 flex flex-wrap justify-center md:gap-5">
        <h4 className="p-1 font-semibold sm:pr-10 sm:text-xl">
          Détail du jour
        </h4>
        <DatePickerButton
          date={selectedDay}
          setValue={setSelectedDay}
          min={from}
          max={to}
          placement="top-end"
        />
      </div>
      <div className="m-3 grid grid-cols-2 p-1 text-center text-sm sm:text-lg">
        <p>Calories : {printDay?.totalKcal ?? '—'} kcal</p>
        <p>Objectif : {printDay?.goalKcal ?? '—'} kcal</p>
        <p>Protéines : {printDay?.totalProtein ?? '—'} g</p>
        <p>Glucides : {printDay?.totalCarbs ?? '—'} g</p>
        <p>Lipides : {printDay?.totalFat ?? '—'} g</p>
        <p>Poids : {printDay?.weight ?? '—'} kg</p>
      </div>
      <div className="flex flex-col">
        <h4 className="self-center-safe text-sm font-semibold sm:py-3 sm:text-sm">
          Exporter mes données
        </h4>
        {error && (
          <p
            role="alert"
            className="flex justify-center text-[9px] text-red-500"
          >
            Pas de données utilisateur
          </p>
        )}
        <button
          className={`${BUTTON_CLASS} border-t py-3`}
          onClick={() => ValidateJson({ data: printDay, onError: setError })}
        >
          Jour
          <ChevronRight height={20} width={20} className="text-gray-300" />
        </button>
        <button
          className={`${BUTTON_CLASS} rounded-b-2xl py-3 last:border-b-0`}
          onClick={() => ValidateJson({ data: dashboard, onError: setError })}
        >
          Période
          <ChevronRight height={20} width={20} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
