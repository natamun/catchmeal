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
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const min = new Date(from);
  const max = new Date(to);

  const date = selectedDay?.toISOString().split('T')[0];
  const title = date?.slice(5).split('-').reverse().join('-');
  const printDay = dashboard.find((d) => d.day === date);

  return (
    <div className="grid">
      <div className="flex justify-center p-3">
        <DatePickerButton
          date={selectedDay}
          setValue={setSelectedDay}
          min={min}
          max={max}
        />
      </div>
      <div className="rounded-2xl border border-green-500 bg-green-300 p-3 shadow-sm">
        <h4 className="p-1 font-semibold sm:text-xl">Détail du {title}</h4>
        <div className="grid grid-cols-2 gap-x-3 text-sm sm:text-lg">
          <p>Calories : {printDay?.totalKcal ?? '—'} kcal</p>
          <p>Objectif : {printDay?.goalKcal ?? '—'} kcal</p>
          <p>Protéines : {printDay?.totalProtein ?? '—'} g</p>
          <p>Glucides : {printDay?.totalCarbs ?? '—'} g</p>
          <p>Lipides : {printDay?.totalFat ?? '—'} g</p>
          <p>Poids : {printDay?.weight ?? '—'} kg</p>
        </div>
      </div>
    </div>
  );
}
