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
import { LoadError } from '../components/ui/LoadError';
import useDashboard from '../hooks/useDashboard';

export default function StatsPage() {
  const [period, setPeriod] = useState(() => lastDays(7));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const from = toApiDate(period.from);
  const to = toApiDate(period.to);
  const { days, isLoading, hasError, retry } = useDashboard(from, to);
  const day = clamp(selectedDay, { start: period.from, end: period.to });
  const dayData = days.find((entry) => entry.day === toApiDate(day));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h1 className="sr-only">Statistiques</h1>
      <PeriodSelector period={period} onChange={setPeriod} />

      {hasError ? (
        <div className="rounded-2xl border border-green-200 bg-white shadow-sm">
          <LoadError
            message="Impossible de charger les statistiques."
            onRetry={retry}
          />
        </div>
      ) : (
        <div
          key={`${from}:${to}`}
          className="flex animate-fade-in-up flex-col gap-4 md:gap-6"
        >
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <NutritionAverages
              days={days}
              isLoading={isLoading}
              className="lg:col-span-2"
            />
            <WeightVariation days={days} isLoading={isLoading} />
          </div>

          <CalorieChart days={days} isLoading={isLoading} />
          <WeightChart days={days} period={period} isLoading={isLoading} />

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <DayDetail
              day={day}
              onDayChange={setSelectedDay}
              period={period}
              data={dayData}
              isLoading={isLoading}
              className="lg:col-span-2"
            />
            <DataExport
              day={day}
              dayData={dayData}
              period={period}
              days={days}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
