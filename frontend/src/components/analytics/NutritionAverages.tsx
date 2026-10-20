import { CalendarDays } from 'lucide-react';

import { MACROS } from '../../constants/macros';
import { Skeleton } from '../ui/Skeleton';
import { StatTile } from '../ui/StatTile';
import { SummaryCard } from '../ui/SummaryCard';
import { averageOf } from './buildDataGraph';
import { MACRO_TOTAL_KEYS } from './macroSeries';
import type { DashboardDay } from './types';

interface Props {
  days: DashboardDay[];
  isLoading?: boolean;
  className?: string;
}

export function NutritionAverages({
  days,
  isLoading = false,
  className,
}: Props) {
  const logged = days.filter((day) => day.totalKcal !== null);
  const hasData = logged.length > 0;
  const kcal = averageOf(logged, 'totalKcal');

  return (
    <SummaryCard
      title="Moyennes par jour"
      busy={isLoading}
      className={className}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ) : hasData ? (
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
            Aucun repas enregistré sur cette période.
          </p>
        )}
        <dl className="grid grid-cols-3 gap-3 max-2xs:grid-cols-1 sm:flex-1">
          {MACROS.map(({ key, label }) => (
            <StatTile key={key} label={label}>
              {isLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : hasData ? (
                `${averageOf(logged, MACRO_TOTAL_KEYS[key])} g`
              ) : (
                '–'
              )}
            </StatTile>
          ))}
        </dl>
      </div>
    </SummaryCard>
  );
}
