import { useState } from 'react';
import { clamp } from 'date-fns';

import CalorieChart from '../components/analytics/CalorieChart';
import DataExport from '../components/analytics/DataExport';
import DayDetail from '../components/analytics/DayDetail';
import NutritionAverages from '../components/analytics/NutritionAverages';
import { lastDays } from '../components/analytics/period';
import PeriodSelector from '../components/analytics/PeriodSelector';
import WeightChart from '../components/analytics/WeightChart';
import WeightVariation from '../components/analytics/WeightVariation';
import { toApiDate } from '../components/meal/api';
import useDashboard from '../hooks/useDashboard';

export default function StatsPage() {
  const [period, setPeriod] = useState(() => lastDays(7));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const from = toApiDate(period.from);
  const to = toApiDate(period.to);
  const [error, setError] = useState(false);
  const { dashboard } = useDashboard({
    fromStr: from,
    toStr: to,
    onError: setError,
  });

  const day = clamp(selectedDay, { start: period.from, end: period.to });
  const dayData = dashboard.find((entry) => entry.day === toApiDate(day));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h1 className="sr-only">Statistiques</h1>
      {error === true && (
        <p className="flex justify-center text-sm text-red-500">
          Impossible de charger vos données. Réessayez.
        </p>
      )}
      <PeriodSelector period={period} onChange={setPeriod} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <NutritionAverages
          days={dashboard}
          unavailable={error}
          className="lg:col-span-2"
        />
        <WeightVariation days={dashboard} unavailable={error} />
      </div>

      <CalorieChart days={dashboard} />
      <WeightChart days={dashboard} period={period} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <DayDetail
          day={day}
          onDayChange={setSelectedDay}
          period={period}
          data={dayData}
          className="lg:col-span-2"
        />
        <DataExport
          day={day}
          dayData={dayData}
          period={period}
          days={dashboard}
        />
      </div>
    </div>
  );
}
