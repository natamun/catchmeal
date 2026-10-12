import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { BaseDialog } from '../ui/BaseDialog';
import { Input } from '../ui/Input';
import {
  getWeightHistory,
  logWeight,
  updateWeight,
  type LogWeightInput,
  type WeightEntry,
} from './api';

interface Props {
  userId: number;
  targetWeight?: number | null;
  onLatestWeight?: (weight: number) => void;
}

const FIELDS: {
  key: keyof LogWeightInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  required?: boolean;
}[] = [
  {
    key: 'weight',
    label: 'Poids',
    unit: 'kg',
    min: 20,
    max: 500,
    required: true,
  },
  { key: 'bodyFat', label: 'Masse grasse', unit: '%', min: 1, max: 100 },
  { key: 'fatFreeMass', label: 'Masse maigre', unit: 'kg', min: 1, max: 300 },
  { key: 'bodyWater', label: 'Eau corporelle', unit: '%', min: 1, max: 100 },
  {
    key: 'muscleMass',
    label: 'Masse musculaire',
    unit: 'kg',
    min: 1,
    max: 300,
  },
];

export function WeightCard({ userId, targetWeight, onLatestWeight }: Props) {
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    getWeightHistory(userId)
      .then((entries) => {
        setHistory(entries);
        if (entries[0]) onLatestWeight?.(entries[0].weight);
      })
      .catch(() => setLoadError("Impossible de charger l'historique"))
      .finally(() => setLoading(false));
  }, [userId, onLatestWeight]);

  function openDialog() {
    setDraft({});
    setError(null);
    dialogRef.current?.showModal();
  }

  async function handleSave() {
    const weight = parseFloat(draft.weight ?? '');
    if (!weight || weight <= 0) return;

    const input: LogWeightInput = { weight };
    for (const f of FIELDS.slice(1)) {
      const v = parseFloat(draft[f.key] ?? '');
      if (!isNaN(v) && v > 0) input[f.key] = v;
    }

    setSaving(true);
    setError(null);
    try {
      const entry = await logWeight(userId, input);
      setHistory((prev) => [entry, ...prev]);
      onLatestWeight?.(entry.weight);
      dialogRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(entry: WeightEntry) {
    setEditingId(entry.id);
    setEditDraft(String(entry.weight));
    setTimeout(() => editInputRef.current?.select(), 0);
  }

  async function handleEditSave(entry: WeightEntry) {
    const weight = parseFloat(editDraft);
    if (!weight || weight <= 0) {
      setEditingId(null);
      return;
    }
    try {
      const updated = await updateWeight(userId, entry.id, {
        weight,
        bodyFat: entry.bodyFat ?? undefined,
        fatFreeMass: entry.fatFreeMass ?? undefined,
        bodyWater: entry.bodyWater ?? undefined,
        muscleMass: entry.muscleMass ?? undefined,
      });
      setHistory((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
      if (history[0]?.id === entry.id) onLatestWeight?.(updated.weight);
    } catch {
      // revert silently
    } finally {
      setEditingId(null);
    }
  }

  const latest = history[0];

  const lastKnown = {
    bodyFat: history.find((e) => e.bodyFat !== null)?.bodyFat ?? null,
    fatFreeMass:
      history.find((e) => e.fatFreeMass !== null)?.fatFreeMass ?? null,
    bodyWater: history.find((e) => e.bodyWater !== null)?.bodyWater ?? null,
    muscleMass: history.find((e) => e.muscleMass !== null)?.muscleMass ?? null,
  };

  return (
    <>
      <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-green-500 uppercase">
            Composition corporelle
          </p>
          <button
            type="button"
            onClick={openDialog}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
            aria-label="Ajouter une entrée"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {loadError && <p className="text-sm text-red-500">{loadError}</p>}
        {!loading && !loadError && !latest && (
          <p className="text-sm text-green-400">Aucune entrée pour l'instant</p>
        )}

        {latest && (
          <div className="mb-3 flex flex-col gap-0.5">
            <p className="text-3xl font-bold text-green-800">
              {latest.weight.toFixed(1)}
              <span className="ml-1 text-lg font-semibold text-green-600">
                kg
              </span>
            </p>
            <span className="text-sm text-green-500">
              {new Date(latest.loggedAt).toLocaleDateString('fr-FR')}
            </span>
            {targetWeight && (
              <span className="text-sm text-green-400">
                objectif {targetWeight} kg
              </span>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {lastKnown.bodyFat !== null && (
                <span className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-700">
                  Masse grasse {lastKnown.bodyFat}%
                </span>
              )}
              {lastKnown.fatFreeMass !== null && (
                <span className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-700">
                  Masse maigre {lastKnown.fatFreeMass} kg
                </span>
              )}
              {lastKnown.bodyWater !== null && (
                <span className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-700">
                  Eau {lastKnown.bodyWater}%
                </span>
              )}
              {lastKnown.muscleMass !== null && (
                <span className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-700">
                  Muscles {lastKnown.muscleMass} kg
                </span>
              )}
            </div>
          </div>
        )}

        {history.length > 1 && (
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto border-t border-green-100 pt-3">
            {history.slice(1).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2"
              >
                <span className="text-xs text-green-500">
                  {new Date(entry.loggedAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {editingId === entry.id ? (
                  <div className="w-16">
                    <Input
                      ref={editInputRef}
                      type="number"
                      min={20}
                      max={500}
                      step={0.1}
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onBlur={() => void handleEditSave(entry)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleEditSave(entry);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="[appearance:textfield] py-0.5 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(entry)}
                    className="text-sm font-semibold text-green-800 hover:text-green-600"
                  >
                    {entry.weight.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-green-400">
                      kg
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BaseDialog dialogRef={dialogRef} title="Nouvelle entrée" maxWidth="sm">
        <div className="flex flex-col gap-3">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <label className="w-36 shrink-0 text-sm text-green-700">
                {f.label}
                {f.required && <span className="text-red-400"> *</span>}
              </label>
              <div className="relative flex-1">
                <Input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={0.1}
                  placeholder={f.required ? 'Obligatoire' : 'Optionnel'}
                  value={draft[f.key] ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                  }
                  className="[appearance:textfield] pr-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-green-400">
                  {f.unit}
                </span>
              </div>
            </div>
          ))}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !draft.weight}
            className="mt-1 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </BaseDialog>
    </>
  );
}
