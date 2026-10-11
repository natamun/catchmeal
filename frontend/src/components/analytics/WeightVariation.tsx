import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import type { DashboardDay } from '../../types/dashboard-analytics';
import { formatKg } from '../../utils/format';
import SummaryCard from '../ui/SummaryCard';

interface Props {
  days: DashboardDay[];
  unavailable?: boolean;
}

export default function WeightVariation({ days, unavailable = false }: Props) {
  const weights = unavailable
    ? []
    : days.flatMap(({ weight }) => (weight === null ? [] : [weight]));
  const first = weights.at(0);
  const last = weights.at(-1);

  if (first === undefined || last === undefined || weights.length < 2) {
    return (
      <SummaryCard title="Variation de poids">
        <p className="text-sm text-green-600">
          {unavailable
            ? 'Données indisponibles.'
            : first === undefined
              ? 'Aucune pesée sur cette période.'
              : `Une seule pesée sur cette période : ${formatKg(first)} kg.`}
        </p>
      </SummaryCard>
    );
  }

  const change = last - first;
  const stable = Math.abs(change) < 0.05;
  const TrendIcon = stable ? Minus : change > 0 ? TrendingUp : TrendingDown;
  const sign = stable ? '' : change > 0 ? '+' : '−';
  const spokenSign = stable ? '' : change > 0 ? 'plus ' : 'moins ';

  return (
    <SummaryCard title="Variation de poids">
      <div className="flex items-end gap-2">
        <span
          className="text-4xl font-bold text-green-800"
          aria-label={`Variation : ${spokenSign}${formatKg(Math.abs(change))} kilogrammes`}
        >
          {sign}
          {formatKg(Math.abs(change))}
        </span>
        <span className="mb-1 text-green-500" aria-hidden="true">
          kg
        </span>
      </div>
      <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
        <TrendIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {stable
          ? `Stable à ${formatKg(last)} kg`
          : `De ${formatKg(first)} à ${formatKg(last)} kg`}
      </p>
    </SummaryCard>
  );
}
