import { CalendarDays } from 'lucide-react';

import type { DashboardDay } from '../../types/dashboard-analytics';
import StatTile from '../ui/StatTile';
import SummaryCard from '../ui/SummaryCard';

const MACROS = [
  { label: 'Protéines', key: 'totalProtein' },
  { label: 'Glucides', key: 'totalCarbs' },
  { label: 'Lipides', key: 'totalFat' },
] as const;

type NutrientKey = 'totalKcal' | (typeof MACROS)[number]['key'];

function average(days: DashboardDay[], key: NutrientKey) {
  const total = days.reduce((sum, day) => sum + (day[key] ?? 0), 0);

  return Math.round(total / days.length);
}

interface Props {
  days: DashboardDay[];
  unavailable?: boolean;
  className?: string;
}

export default function NutritionAverages({
  days,
  unavailable = false,
  className,
}: Props) {
  const logged = unavailable
    ? []
    : days.filter((day) => day.totalKcal !== null);
  const hasData = logged.length > 0;
  const kcal = hasData ? average(logged, 'totalKcal') : 0;

  return (
    <SummaryCard title="Moyennes par jour" className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        {hasData ? (
          <div>
            <div className="flex items-end gap-2">
              <span
                className="text-4xl font-bold text-green-800"
                aria-label={`Moyenne : ${kcal} kilocalories par jour`}
              >
                {kcal}
              </span>
              <span className="mb-1 text-green-500" aria-hidden="true">
                kcal
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              {logged.length} {logged.length > 1 ? 'jours' : 'jour'} de suivi
            </p>
          </div>
        ) : (
          <p className="text-sm text-green-600">
            {unavailable
              ? 'Données indisponibles.'
              : 'Aucun repas enregistré sur cette période.'}
          </p>
        )}
        <dl className="grid grid-cols-3 gap-3 max-2xs:grid-cols-1 sm:flex-1">
          {MACROS.map(({ label, key }) => (
            <StatTile key={key} label={label}>
              {hasData ? `${average(logged, key)} g` : '–'}
            </StatTile>
          ))}
        </dl>
      </div>
    </SummaryCard>
  );
}
