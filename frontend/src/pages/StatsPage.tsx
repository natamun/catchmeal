import { useState } from 'react';
import { Broccoli, Weight } from 'lucide-react';

import Charts from '../components/analytics/Charts';
import DatePick from '../components/analytics/DatePick';
import MacroCard from '../components/analytics/MacroCard';
import ShowDataDay from '../components/analytics/ShowDataDay';
import StatCard from '../components/analytics/StatCard';
import useDashboard from '../hooks/useDashboard';
import type { DashboardDay } from '../types/dashboard-analytics';

export default function StatsPage() {
  const [dashboard, setDashboard] = useState<DashboardDay[]>([]);
  const [from, setFrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
      .toISOString()
      .split('T')[0],
  );
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  useDashboard({ setDashboard, fromStr: from, toStr: to });

  const DayKcal = dashboard.filter((d) => d.totalKcal !== null);
  const RecordWeight = dashboard.filter((d) => d.weight !== null);

  const averageKcal = DayKcal.length
    ? Math.round(
        DayKcal.reduce((s, d) => s + (d.totalKcal ?? 0), 0) / DayKcal.length,
      )
    : 0;

  const averageProtein = DayKcal.length
    ? Math.round(
        DayKcal.reduce((s, d) => s + (d.totalProtein ?? 0), 0) / DayKcal.length,
      )
    : 0;

  const averageCarbs = DayKcal.length
    ? Math.round(
        DayKcal.reduce((s, d) => s + (d.totalCarbs ?? 0), 0) / DayKcal.length,
      )
    : 0;

  const averageFat = DayKcal.length
    ? Math.round(
        DayKcal.reduce((s, d) => s + (d.totalFat ?? 0), 0) / DayKcal.length,
      )
    : 0;

  const LastWeight = RecordWeight.at(-1)?.weight ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex-col">
        <DatePick from={from} to={to} setFrom={setFrom} setTo={setTo} />

        <div className="p-1">
          <h3 className="p-1 text-center font-semibold">Résumé</h3>
          <div className="grid gap-3 sm:mt-1 sm:grid-cols-2">
            <StatCard
              title="Moyenne Kcal/jour"
              value={averageKcal || '┄'}
              unit="kcal"
              Icon={Broccoli}
            />
            <StatCard
              title="Poids actuel"
              value={LastWeight || '┄'}
              unit="kg"
              Icon={Weight}
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

      <div className="flex justify-center">
        <ShowDataDay dashboard={dashboard} to={to} from={from}></ShowDataDay>
      </div>
    </div>
  );
}
