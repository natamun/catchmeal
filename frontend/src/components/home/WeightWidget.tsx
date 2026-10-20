import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { formatKg } from '../../utils/format';
import { StatTile } from '../ui/StatTile';
import { SummaryCard } from '../ui/SummaryCard';

interface Props {
  history: { weight: number; loggedAt: string }[] | null;
  hasError?: boolean;
  goalWeight: number | null;
}

function formatDay(isoDate: string) {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  return `${day === 1 ? '1er' : day} ${month}`;
}

export function WeightWidget({ history, hasError = false, goalWeight }: Props) {
  const isLoading = history === null && !hasError;
  const current = history?.[0] ?? null;
  const previous = history?.[1] ?? null;

  const change =
    current === null || previous === null
      ? null
      : current.weight - previous.weight;
  const stable = change !== null && Math.abs(change) < 0.05;
  const TrendIcon =
    change === null || stable ? Minus : change > 0 ? TrendingUp : TrendingDown;

  const gap =
    current === null || goalWeight === null
      ? null
      : current.weight - goalWeight;
  const reached = gap !== null && Math.abs(gap) < 0.05;

  return (
    <SummaryCard title="Poids & Objectif" busy={isLoading}>
      {isLoading && (
        <div className="flex animate-pulse flex-col gap-2" aria-hidden="true">
          <div className="h-10 w-24 rounded-lg bg-green-100" />
          <div className="h-4 w-40 rounded bg-green-100" />
        </div>
      )}
      {hasError && (
        <p className="text-sm text-green-600">
          Impossible de charger les pesées.
        </p>
      )}
      {history !== null && current === null && (
        <p className="text-sm text-green-600">Aucune pesée enregistrée.</p>
      )}
      {current !== null && (
        <>
          <div className="flex items-end gap-2">
            <span
              className="text-4xl font-bold text-green-800"
              aria-label={`Poids actuel : ${formatKg(current.weight)} kilogrammes`}
            >
              {formatKg(current.weight)}
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
        </>
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
