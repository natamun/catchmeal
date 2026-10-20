import { useState } from 'react';

import { useCurrentUser } from '../auth/authContext';
import CalorieChart from '../components/analytics/CalorieChart';
import DataExport from '../components/analytics/DataExport';
import MeasureChart, {
  type MeasureKey,
} from '../components/analytics/MeasureChart';
import NutritionAverages from '../components/analytics/NutritionAverages';
import { lastDays } from '../components/analytics/period';
import PeriodSelector from '../components/analytics/PeriodSelector';
import WeightVariation from '../components/analytics/WeightVariation';
import { toApiDate } from '../components/meal/api';
import { LoadError } from '../components/ui/LoadError';
import useDashboard from '../hooks/useDashboard';

export default function StatsPage() {
  const user = useCurrentUser();
  const [period, setPeriod] = useState(() => lastDays(7));
  const [measure, setMeasure] = useState<MeasureKey>('weight');
  const from = toApiDate(period.from);
  const to = toApiDate(period.to);
  const { days, isLoading, hasError, retry } = useDashboard(from, to);

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
          <MeasureChart
            measure={measure}
            onMeasureChange={setMeasure}
            targetWeight={user.targetWeight ?? null}
            days={days}
            period={period}
            isLoading={isLoading}
          />

          <DataExport period={period} days={days} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
