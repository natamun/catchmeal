import { useState } from 'react';

import iconWeight from '../assets/poids.svg';
import iconKcal from '../assets/poire.svg';
import Charts from '../components/analytics/Charts';
import DatePick from '../components/analytics/DatePick';
import MacroCard from '../components/analytics/MacroCard';
import StatCard from '../components/analytics/StatCard';
import useDashboard from '../hooks/useDashboard';
import type { DashboardDay } from '../types/dashboard-analytics';
import buildWeightDate from '../utils/BuildWeightDate';

export default function StatsPage() {
  const [dashboard, setDashboard] = useState<DashboardDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<DashboardDay | null>(null);
  const [from, setFrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split('T')[0],
  );
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  useDashboard({ setDashboard, fromStr: from, toStr: to });

  const kcalData = dashboard.map((d) => ({
    date: d.day.slice(5),
    kcal: d.totalKcal ?? 0,
    objectif: d.goalKcal ?? 0,
  }));

  const weightData = buildWeightDate(dashboard);
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
      <div className="flex flex-col items-center gap-1 md:items-start">
        <h1 className="text-2xl font-bold text-green-600 md:text-3xl lg:text-5xl">
          Statistiques
        </h1>
        <p className="text-sm text-green-600 md:text-lg">
          Suis ton évolution sur une période
        </p>
      </div>

      <div className="flex-col">
        <DatePick from={from} to={to} setFrom={setFrom} setTo={setTo} />

        <div className="p-1">
          <h3 className="text-center font-semibold text-green-500">Résumé</h3>
          <p className="p-0.5 text-center text-xs font-semibold text-green-400">
            Moyenne sur la période
          </p>
          <div className="grid gap-3 md:mt-1 md:grid-cols-2">
            <StatCard
              title="Moyenne Kcal/jour"
              value={averageKcal || 'No data'}
              unit="kcal"
              img={iconKcal}
            />
            <StatCard
              title="Poids actuel"
              value={LastWeight || 'No data'}
              unit="kg"
              img={iconWeight}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 justify-center gap-1">
            <MacroCard
              title="Moyenne Protéines"
              value={averageProtein || 'No data'}
              unit="g"
            />
            <MacroCard
              title="Moyenne Glucides"
              value={averageCarbs || 'No data'}
              unit="g"
            />
            <MacroCard
              title="Moyenne Lipides"
              value={averageFat || 'No data'}
              unit="g"
            />
          </div>
        </div>
      </div>

      <div>
        <Charts
          kcalData={kcalData}
          weightData={weightData}
          dashboard={dashboard}
          onSelectDay={setSelectedDay}
          selectedDay={selectedDay}
        />
      </div>

      <div className="flex flex-col gap-6">
        {/* <pre>{JSON.stringify(dashboard, null, 2)}</pre> */}
      </div>
    </div>
  );
}
