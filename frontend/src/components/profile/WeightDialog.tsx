import { useId, useRef, useState, type RefObject } from 'react';
import { Trash2 } from 'lucide-react';

import { useTimeout } from '../../hooks/useTimeout';
import { formatDayMonth } from '../../utils/format';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';
import { deleteWeight, logWeight, updateWeight, type WeightEntry } from './api';
import { COMPOSITION, MEASURES, type MeasureKey } from './measures';

const [WEIGHT] = MEASURES;

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

function toText(value: number | null | undefined) {
  return String(value ?? '').replace('.', ',');
}

function toNumber(text: string) {
  const trimmed = text.trim();

  return trimmed === '' ? null : Number(trimmed.replace(',', '.'));
}

function toForm(entry: WeightEntry | null): Record<MeasureKey, string> {
  return {
    weight: toText(entry?.weight),
    bodyFat: toText(entry?.bodyFat),
    fatFreeMass: toText(entry?.fatFreeMass),
    bodyWater: toText(entry?.bodyWater),
    muscleMass: toText(entry?.muscleMass),
  };
}

function validate(form: Record<MeasureKey, string>) {
  const errors: Partial<Record<MeasureKey, string>> = {};

  for (const { key, unit, min, max } of MEASURES) {
    const value = toNumber(form[key]);

    if (value === null) {
      if (key === 'weight') {
        errors.weight = 'Poids obligatoire';
      }
    } else if (Number.isNaN(value) || value < min || value > max) {
      errors[key] = `Entre ${min} et ${max} ${unit}`;
    }
  }

  return errors;
}

interface WeightFormProps {
  userId: number;
  entry: WeightEntry | null;
  onSaved: (entry: WeightEntry) => void;
}

function WeightForm({
  userId,
  entry,
  onSaved,
  hasDeleteFailed,
}: WeightFormProps & { hasDeleteFailed: boolean }) {
  const formId = useId();
  const [form, setForm] = useState(() => toForm(entry));
  const [touched, setTouched] = useState<Partial<Record<MeasureKey, boolean>>>(
    {},
  );
  const [focusedField, setFocusedField] = useState<MeasureKey | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);

  const errors = validate(form);

  const handleChange = (field: MeasureKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: MeasureKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((current) => (current === field ? null : current));
  };

  const errorMessage = (field: MeasureKey) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasFailed(false);
    setTouched(Object.fromEntries(MEASURES.map(({ key }) => [key, true])));

    const weight = toNumber(form.weight);

    if (weight === null || Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    const input = {
      weight,
      bodyFat: toNumber(form.bodyFat),
      fatFreeMass: toNumber(form.fatFreeMass),
      bodyWater: toNumber(form.bodyWater),
      muscleMass: toNumber(form.muscleMass),
    };

    setIsSubmitting(true);
    try {
      onSaved(
        entry
          ? await updateWeight(userId, entry.id, input)
          : await logWeight(userId, input),
      );
    } catch {
      setHasFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = ({ key: field, example }: (typeof MEASURES)[number]) => (
    <>
      <Input
        id={`${formId}-${field}`}
        type="text"
        inputMode="decimal"
        placeholder={`Ex : ${example}`}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        onFocus={() => setFocusedField(field)}
        onBlur={() => handleBlur(field)}
        aria-invalid={Boolean(touched[field] && errors[field])}
        aria-describedby={`${formId}-${field}-error`}
      />
      <FieldError
        id={`${formId}-${field}-error`}
        message={errorMessage(field)}
      />
    </>
  );

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      autoComplete="off"
      className="flex flex-col gap-5"
    >
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor={`${formId}-weight`} className={LABEL_CLASS}>
          Poids <span className="normal-case">(kg)</span>
        </label>
        {renderInput(WEIGHT)}
      </div>

      <fieldset className="min-w-0">
        <legend className={`mb-1.5 ${LABEL_CLASS}`}>
          Composition corporelle (optionnel)
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {COMPOSITION.map((measure) => (
            <div key={measure.key} className="relative flex flex-col gap-1">
              <label
                htmlFor={`${formId}-${measure.key}`}
                className="text-xs text-green-500"
              >
                {measure.label} ({measure.unit})
              </label>
              {renderInput(measure)}
            </div>
          ))}
        </div>
      </fieldset>

      {hasFailed && (
        <p role="alert" className="text-sm text-red-500">
          Impossible d&apos;enregistrer la pesée. Réessayez.
        </p>
      )}
      {hasDeleteFailed && (
        <p role="alert" className="text-sm text-red-500">
          Impossible de supprimer la pesée. Réessayez.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}

interface Props extends WeightFormProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  openCount: number;
  onDeleted: (entryId: number) => void;
}

export function WeightDialog({
  dialogRef,
  openCount,
  userId,
  entry,
  onSaved,
  onDeleted,
}: Props) {
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDeleteFailed, setHasDeleteFailed] = useState(false);
  const day = entry ? formatDayMonth(new Date(entry.loggedAt)) : '';

  const handleDelete = async () => {
    if (!entry) {
      return;
    }

    setHasDeleteFailed(false);
    setIsDeleting(true);
    try {
      await deleteWeight(userId, entry.id);
      dialogRef.current?.close();
      onDeleted(entry.id);
    } catch {
      setHasDeleteFailed(true);
    } finally {
      setIsDeleting(false);
      confirmDialogRef.current?.close();
    }
  };

  return (
    <>
      <BaseDialog
        dialogRef={dialogRef}
        title={entry ? `Pesée du ${day}` : 'Nouvelle pesée'}
        maxWidth="sm"
        onClose={() => setHasDeleteFailed(false)}
        headerActions={
          entry && (
            <button
              type="button"
              onClick={() => confirmDialogRef.current?.showModal()}
              aria-label="Supprimer la pesée"
              className="cursor-pointer text-green-400 transition-colors hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )
        }
      >
        <WeightForm
          key={openCount}
          userId={userId}
          entry={entry}
          hasDeleteFailed={hasDeleteFailed}
          onSaved={(saved) => {
            dialogRef.current?.close();
            onSaved(saved);
          }}
        />
      </BaseDialog>

      <ConfirmDialog
        dialogRef={confirmDialogRef}
        title="Supprimer cette pesée ?"
        description={`La pesée du ${day} sera retirée de l'historique.`}
        confirmLabel="Supprimer"
        pendingLabel="Suppression..."
        isPending={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
