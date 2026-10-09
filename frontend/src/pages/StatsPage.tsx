import { useState } from 'react';
import { Broccoli } from 'lucide-react';

import Charts from '../components/analytics/Charts';
import DatePick from '../components/analytics/DatePick';
import MacroCard from '../components/analytics/MacroCard';
import ShowDataDay from '../components/analytics/ShowDataDay';
import StatCard from '../components/analytics/StatCard';
import WeightCard from '../components/analytics/WeightCard';
import useDashboard from '../hooks/useDashboard';

export default function StatsPage() {
  const [from, setFrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
      .toISOString()
      .split('T')[0],
  );
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
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
    <div className="flex flex-col gap-2">
      {error === true && (
        <p className="flex justify-center text-sm text-red-500">
          Impossible de charger vos données. Réessayez.
        </p>
      )}
      <div className="flex-col">
        <DatePick from={from} to={to} setFrom={setFrom} setTo={setTo} />

        <div className="mt-1 p-1">
          <div className="grid gap-3 sm:mt-1 sm:grid-cols-2">
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
      </div>

      <div>
        <Charts dashboard={dashboard} />
      </div>

      <div className="mt-1 flex flex-col flex-wrap justify-between rounded-2xl border border-green-200 bg-white">
        <ShowDataDay dashboard={dashboard} to={to} from={from}></ShowDataDay>
      </div>
    </div>
  );
}
