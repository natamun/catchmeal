import { useState } from 'react';

import type { DashboardDay } from '../../types/dashboard-analytics';
import { DatePickerButton } from './DatePickerButton';

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

  const printDay = dashboard.find((d) => d.day === selectedDay);

  return (
    <div>
      <div className="m-3 flex flex-wrap justify-center md:gap-5">
        <h4 className="p-1 font-semibold sm:text-xl">Détail du jour</h4>
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
    </div>
  );
}
