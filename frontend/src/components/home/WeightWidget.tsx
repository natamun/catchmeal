import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import StatTile from './StatTile';
import SummaryCard from './SummaryCard';

interface Props {
  currentWeight: number;
  previous: { weight: number; loggedAt: string } | null;
  goalWeight: number | null;
}

const formatKg = (value: number) =>
  value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

function formatDay(isoDate: string) {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  return `${day === 1 ? '1er' : day} ${month}`;
}

export default function WeightWidget({
  currentWeight,
  previous,
  goalWeight,
}: Props) {
  const change = previous === null ? null : currentWeight - previous.weight;
  const stable = change !== null && Math.abs(change) < 0.05;
  const TrendIcon =
    change === null || stable ? Minus : change > 0 ? TrendingUp : TrendingDown;

  const gap = goalWeight === null ? null : currentWeight - goalWeight;
  const reached = gap !== null && Math.abs(gap) < 0.05;

  return (
    <SummaryCard title="Poids & Objectif">
      <div className="flex items-end gap-2">
        <span
          className="text-4xl font-bold text-green-800"
          aria-label={`Poids actuel : ${formatKg(currentWeight)} kilogrammes`}
        >
          {formatKg(currentWeight)}
        </span>
        <span className="mb-1 text-green-500" aria-hidden="true">
          kg
        </span>
      </div>
      {previous !== null && change !== null && (
        <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
          <TrendIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {stable
            ? `Stable depuis le ${formatDay(previous.loggedAt)}`
            : `${change > 0 ? '+' : '−'}${formatKg(Math.abs(change))} kg depuis le ${formatDay(previous.loggedAt)}`}
        </p>
      )}
      <dl className="mt-auto grid grid-cols-2 gap-3 pt-3">
        <StatTile label="Objectif">
          {goalWeight === null ? 'Non défini' : `${formatKg(goalWeight)} kg`}
        </StatTile>
        {gap !== null && (
          <StatTile
            label={
              reached
                ? 'Statut'
                : gap > 0
                  ? 'Reste à perdre'
                  : 'Reste à prendre'
            }
          >
            {reached ? 'Atteint' : `${formatKg(Math.abs(gap))} kg`}
          </StatTile>
        )}
      </dl>
    </SummaryCard>
  );
}
