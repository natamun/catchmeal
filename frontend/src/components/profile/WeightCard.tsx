import { useEffect, useState } from 'react';

import { Input } from '../ui/Input';
import { getWeightHistory, logWeight, type WeightEntry } from './api';

interface Props {
  userId: number;
  targetWeight?: number | null;
  onLatestWeight?: (weight: number) => void;
}

export function WeightCard({ userId, targetWeight, onLatestWeight }: Props) {
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWeightHistory(userId)
      .then((entries) => {
        setHistory(entries);
        if (entries[0]) onLatestWeight?.(entries[0].weight);
      })
      .catch(() => setLoadError("Impossible de charger l'historique"))
      .finally(() => setLoading(false));
  }, [userId, onLatestWeight]);

  async function handleSave() {
    const weight = parseFloat(draft);
    if (!weight || weight <= 0) return;

    setSaving(true);
    setError(null);
    try {
      const entry = await logWeight(userId, { weight });
      setHistory((prev) => [entry, ...prev]);
      onLatestWeight?.(entry.weight);
      setDraft('');
      setLogging(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft('');
    setError(null);
    setLogging(false);
  }

  const latest = history[0];

  return (
    <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-green-500 uppercase">
          Poids
        </p>
        {logging ? (
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={20}
              max={500}
              step={0.1}
              placeholder="kg"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className="w-20"
            />
            <button
              onClick={() => void handleSave()}
              disabled={saving || !draft}
              className="rounded-lg bg-green-400 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
            >
              {saving ? '...' : 'OK'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-xs font-medium text-green-400 transition-colors hover:text-green-500"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLogging(true)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-green-100 text-green-500 transition-colors hover:bg-green-200"
            aria-label="Logger le poids"
          >
            +
          </button>
        )}
      </div>
      {error && logging && <p className="mb-2 text-xs text-red-500">{error}</p>}

      {loadError && <p className="text-sm text-red-500">{loadError}</p>}
      {!loading && !loadError && !latest && (
        <p className="text-sm text-green-400">Aucune entrée pour l'instant</p>
      )}

      {latest && (
        <div className="mb-3 flex items-end gap-3">
          <p className="text-3xl font-bold text-green-800">
            {latest.weight.toFixed(2)}
            <span className="ml-1 text-base font-normal text-green-400">
              kg
            </span>
          </p>
          <p className="mb-1 text-xs text-green-400">
            {new Date(latest.loggedAt).toLocaleDateString('fr-FR')}
          </p>
          {targetWeight && (
            <p className="mb-1 text-xs text-green-400">
              · objectif {targetWeight.toFixed(2)} kg
            </p>
          )}
        </div>
      )}

      {history.length > 1 && (
        <div className="flex flex-col gap-1 border-t border-green-100 pt-3">
          {history.slice(1, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between text-xs text-green-400"
            >
              <span>
                {new Date(entry.loggedAt).toLocaleDateString('fr-FR')}
              </span>
              <span>{entry.weight.toFixed(2)} kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
