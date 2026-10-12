import { useEffect, useRef, useState } from 'react';

import { formatKg } from '../../utils/format';
import { AddCircleButton } from '../ui/AddCircleButton';
import { EditIconButton } from '../ui/EditIconButton';
import { LoadError } from '../ui/LoadError';
import Skeleton from '../ui/Skeleton';
import StatTile from '../ui/StatTile';
import SummaryCard from '../ui/SummaryCard';
import { getWeightHistory, type WeightEntry } from './api';
import { COMPOSITION, formatMeasure } from './measures';
import { WeightDialog } from './WeightDialog';

const ROW_COLUMNS =
  'md:grid-cols-[minmax(0,1.5fr)_repeat(5,minmax(0,1fr))_1.5rem]';

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface Props {
  userId: number;
  onLatestWeight?: (weight: number | null) => void;
}

export function WeightCard({ userId, onLatestWeight }: Props) {
  const [history, setHistory] = useState<WeightEntry[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState<{
    entry: WeightEntry | null;
    openCount: number;
  }>({ entry: null, openCount: 0 });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    getWeightHistory(userId, controller.signal)
      .then((entries) => {
        setHistory(entries);
        onLatestWeight?.(entries[0]?.weight ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHasError(true);
          onLatestWeight?.(null);
        }
      });

    return () => controller.abort();
  }, [userId, onLatestWeight, attempt]);

  const retry = () => {
    setHasError(false);
    setAttempt((count) => count + 1);
  };

  const openDialog = (entry: WeightEntry | null) => {
    setDialog(({ openCount }) => ({ entry, openCount: openCount + 1 }));
    dialogRef.current?.showModal();
  };

  const handleSaved = (saved: WeightEntry) => {
    if (history === null) {
      retry();
      return;
    }

    const next = [
      saved,
      ...history.filter((entry) => entry.id !== saved.id),
    ].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));

    setHistory(next);
    onLatestWeight?.(next[0].weight);
  };

  const latest = history?.[0];
  const isLoading = history === null && !hasError;

  return (
    <>
      <SummaryCard
        title="Composition corporelle"
        busy={isLoading}
        aside={
          <AddCircleButton
            label="Ajouter une pesée"
            onClick={() => openDialog(null)}
          />
        }
      >
        {isLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        )}
        {history === null && hasError && (
          <LoadError
            message="Impossible de charger les pesées."
            onRetry={retry}
          />
        )}
        {history !== null && !latest && (
          <p className="text-sm text-green-600">Aucune pesée enregistrée.</p>
        )}
        {history && latest && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              <div className="shrink-0">
                <div className="flex items-end gap-2">
                  <span
                    className="text-4xl font-bold text-green-800"
                    aria-label={`Poids actuel : ${formatKg(latest.weight)} kilogrammes`}
                  >
                    {formatKg(latest.weight)}
                  </span>
                  <span className="mb-1 text-green-500" aria-hidden="true">
                    kg
                  </span>
                </div>
                <p className="mt-1 text-sm text-green-600">
                  Dernière pesée le {formatDate(latest.loggedAt)}
                </p>
              </div>
              <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                {COMPOSITION.map(({ key, label, unit }) => (
                  <StatTile key={key} label={label}>
                    {formatMeasure(
                      history.find((entry) => entry[key] !== null)?.[key] ??
                        null,
                      unit,
                    )}
                  </StatTile>
                ))}
              </dl>
            </div>

            <div className="mt-5 border-t border-green-100 pt-3">
              <div className="max-h-72 overflow-y-auto md:pr-1">
                <div
                  aria-hidden="true"
                  className={`sticky top-0 hidden gap-x-3 bg-white pb-2 text-xs text-green-600 md:grid ${ROW_COLUMNS}`}
                >
                  <span>Date</span>
                  <span>Poids</span>
                  {COMPOSITION.map(({ key, label }) => (
                    <span key={key}>{label}</span>
                  ))}
                </div>
                <ul
                  aria-label="Historique des pesées"
                  className="divide-y divide-green-100"
                >
                  {history.map((entry) => (
                    <li
                      key={entry.id}
                      className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1.5 py-2.5 text-sm ${ROW_COLUMNS}`}
                    >
                      <span className="text-green-600">
                        {formatDate(entry.loggedAt)}
                      </span>
                      <span className="font-semibold whitespace-nowrap text-green-800 tabular-nums">
                        {formatMeasure(entry.weight, 'kg')}
                      </span>
                      <dl
                        className={`col-span-full row-start-2 grid-cols-2 gap-x-2 gap-y-1 text-xs sm:grid-cols-4 sm:gap-x-3 md:contents md:text-sm ${
                          COMPOSITION.some(({ key }) => entry[key] !== null)
                            ? 'grid'
                            : 'hidden'
                        }`}
                      >
                        {COMPOSITION.map(({ key, label, unit }) => (
                          <div
                            key={key}
                            className="flex min-w-0 justify-between gap-1 md:block"
                          >
                            <dt className="truncate text-green-600 md:sr-only">
                              {label}
                            </dt>
                            <dd className="whitespace-nowrap text-green-800 tabular-nums">
                              {formatMeasure(entry[key], unit)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <EditIconButton
                        label={`Modifier la pesée du ${formatDate(entry.loggedAt)}`}
                        onClick={() => openDialog(entry)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </SummaryCard>

      <WeightDialog
        dialogRef={dialogRef}
        openCount={dialog.openCount}
        userId={userId}
        entry={dialog.entry}
        onSaved={handleSaved}
      />
    </>
  );
}
