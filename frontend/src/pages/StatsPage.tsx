import { useState } from 'react';

import iconKcal  from '../assets/poire.svg';
import iconWeight  from '../assets/poids.svg';

import useDashboard from '../hooks/useDashboard';

import Charts from '../components/analytics/Charts'
import DatePick from '../components/analytics/DatePick'
import StatCard from '../components/analytics/StatCard';
import MacroCard from '../components/analytics/MacroCard';

import buildWeightDate from '../utils/BuildWeightDate';

import type { DashboardDay } from '../types/dashboard-analytics';

import { mockDashboard } from "../assets/mockD";

export default function StatsPage() {
  const [dashboard, setDashboard] = useState<DashboardDay[]>(mockDashboard);
  const [selectedDay, setSelectedDay] = useState<DashboardDay | null>(null);
  const [from, setFrom] = useState(new Date( new Date().setDate(new Date().getDate() - 7)));
  const [to, setTo] = useState(new Date());

  const fromStr = from?.toISOString().split('T')[0];
  const toStr = to?.toISOString().split('T')[0];

  useDashboard({ setDashboard, fromStr, toStr });

  const kcalData = dashboard.map(d => ({
    date: d.day.slice(5),
    kcal: d.totalKcal ?? 0,
    objectif: d.goalKcal ?? 0,
  }));

  const weightData = buildWeightDate(dashboard);

  const DayKcal = dashboard.filter((d) => d.totalKcal != null);
  const averageKcal = DayKcal.length
    ? Math.round(DayKcal.reduce((s, d) => s + (d.totalKcal ?? 0), 0) / DayKcal.length)
    : 0;
  
  const averageProtein = DayKcal.length
    ? Math.round(DayKcal.reduce((s, d) => s + (d.totalProtein ?? 0), 0) / DayKcal.length)
    : 0;

  const averageCarbs = DayKcal.length
    ? Math.round(DayKcal.reduce((s, d) => s + (d.totalCarbs ?? 0), 0) / DayKcal.length)
    : 0;

  const averageFat = DayKcal.length
    ? Math.round(DayKcal.reduce((s, d) => s + (d.totalFat ?? 0), 0) / DayKcal.length)
    : 0;

  const RecordWeight = dashboard.filter((d) => d.weight != null);
  const LastWeight = RecordWeight.at(-1)?.weight ?? 0;

    return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 items-center md:items-start">
        <h1 className="text-2xl font-bold text-green-600 md:text-3xl lg:text-5xl">Statistiques</h1>
        <p className="text-sm text-green-600 md:text-lg">Suis ton évolution sur une période</p>
      </div>

      <div className="flex-col"> 
        <DatePick from={from} to={to} setFrom={setFrom} setTo={setTo} />

        <div className="p-1">
          <h3 className="font-semibold text-center text-green-500">Résumé</h3>
          <p className="text-xs text-center text-green-400 font-semibold p-0.5">Moyenne sur la période</p>
          <div className=" grid gap-3 md:grid-cols-2 md:mt-1">
            <StatCard title="Moyenne Kcal/jour" value={averageKcal || "No data"} unit="kcal" img={iconKcal} />
            <StatCard title="Difference de Poids" value={LastWeight || "No data"} unit="kg" img={iconWeight} />
          </div>

          <div className="grid grid-cols-3 gap-1 mt-3 justify-center">
            <MacroCard title="Moyenne Protéines" value={averageProtein || "No data"} unit="g" />
            <MacroCard title="Moyenne Glucides" value={averageCarbs || "No data"} unit="g" />
            <MacroCard title="Moyenne Lipides" value={averageFat || "No data"} unit="g" />
          </div>
        </div>
      </div>

      <div>
        <Charts kcalData={kcalData} weightData={weightData} dashboard={dashboard} onSelectDay={setSelectedDay} selectedDay={selectedDay} />
      </div>

      <div className="flex flex-col gap-6">
        {/* <pre>{JSON.stringify(dashboard, null, 2)}</pre> */}
      </div>
    </div>
    );
  }
