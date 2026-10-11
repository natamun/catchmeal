import { useState } from 'react';
import { Broccoli } from 'lucide-react';

import Charts from '../components/analytics/Charts';
import MacroCard from '../components/analytics/MacroCard';
import { lastDays } from '../components/analytics/period';
import PeriodSelector from '../components/analytics/PeriodSelector';
import ShowDataDay from '../components/analytics/ShowDataDay';
import StatCard from '../components/analytics/StatCard';
import WeightCard from '../components/analytics/WeightCard';
import { toApiDate } from '../components/meal/api';
import useDashboard from '../hooks/useDashboard';

export default function StatsPage() {
  const [period, setPeriod] = useState(() => lastDays(7));
  const from = toApiDate(period.from);
  const to = toApiDate(period.to);
  const [error, setError] = useState(false);
  const { dashboard } = useDashboard({
    fromStr: from,
    toStr: to,
    onError: setError,
  });

  let averageKcal: number | null = null;
  let averageProtein: number | null = null;
  let averageCarbs: number | null = null;
  let averageFat: number | null = null;
  let diffWeight: number | null = null;
  if (error === false) {
    const DayKcal = dashboard.filter((d) => d.totalKcal !== null);
    const RecordWeight = dashboard.filter((d) => d.weight !== null);
    averageKcal = DayKcal.length
      ? Math.round(
          DayKcal.reduce((s, d) => s + (d.totalKcal ?? 0), 0) / DayKcal.length,
        )
      : 0;

    averageProtein = DayKcal.length
      ? Math.round(
          DayKcal.reduce((s, d) => s + (d.totalProtein ?? 0), 0) /
            DayKcal.length,
        )
      : 0;

    averageCarbs = DayKcal.length
      ? Math.round(
          DayKcal.reduce((s, d) => s + (d.totalCarbs ?? 0), 0) / DayKcal.length,
        )
      : 0;

    averageFat = DayKcal.length
      ? Math.round(
          DayKcal.reduce((s, d) => s + (d.totalFat ?? 0), 0) / DayKcal.length,
        )
      : 0;

    const LastWeight = RecordWeight.at(-1)?.weight ?? 0;
    const firstWeight = RecordWeight[0]?.weight ?? null;
    diffWeight =
      firstWeight !== null && LastWeight !== null
        ? Math.round((LastWeight - firstWeight) * 10) / 10
        : null;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h1 className="sr-only">Statistiques</h1>
      {error === true && (
        <p className="flex justify-center text-sm text-red-500">
          Impossible de charger vos données. Réessayez.
        </p>
      )}
      <PeriodSelector period={period} onChange={setPeriod} />

      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            title="Moyenne Kcal / jour"
            value={averageKcal || '┄'}
            unit="kcal"
            Icon={Broccoli}
          />
          <WeightCard
            title="Variation de poids"
            value={diffWeight || '┄'}
            unit="kg"
            average={null}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 justify-center gap-1">
          <MacroCard
            title="Moyenne Protéines"
            value={averageProtein || '┄'}
            unit="g"
          />
          <MacroCard
            title="Moyenne Glucides"
            value={averageCarbs || '┄'}
            unit="g"
          />
          <MacroCard
            title="Moyenne Lipides"
            value={averageFat || '┄'}
            unit="g"
          />
        </div>
      </div>

      <Charts dashboard={dashboard} />

      <div className="flex flex-col flex-wrap justify-between rounded-2xl border border-green-200 bg-white">
        <ShowDataDay dashboard={dashboard} to={to} from={from}></ShowDataDay>
      </div>
    </div>
  );
}
