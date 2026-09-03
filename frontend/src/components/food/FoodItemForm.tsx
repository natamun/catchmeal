import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ScanBarcode,
  Trash2,
  X,
} from 'lucide-react';

import { Toast } from '../ui/Toast';
import {
  ApiError,
  createFoodItem,
  deleteFoodItem,
  updateFoodItem,
} from './api';
import type { FoodItem, QuantityUnit } from './types';

interface FoodItemFormState {
  name: string;
  brand: string;
  baseQuantity: string;
  baseUnit: QuantityUnit;
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
}

const EMPTY_FORM: FoodItemFormState = {
  name: '',
  brand: '',
  baseQuantity: '',
  baseUnit: 'GRAM',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
};

const INPUT_CLASS =
  'w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400 aria-invalid:border-red-400';

const UNIT_OPTIONS = [
  { value: 'GRAM', label: 'Grammes' },
  { value: 'PIECE', label: 'Pièce' },
] as const;

const MACRO_FIELDS = [
  { field: 'kcal', label: 'Kcal' },
  { field: 'protein', label: 'Protéines (g)' },
  { field: 'carbs', label: 'Glucides (g)' },
  { field: 'fat', label: 'Lipides (g)' },
] as const;

function itemToForm(item: FoodItem): FoodItemFormState {
  return {
    name: item.name,
    brand: item.brand ?? '',
    baseQuantity: String(item.baseQuantity),
    baseUnit: item.baseUnit,
    kcal: String(item.kcal),
    protein: String(item.protein),
    carbs: String(item.carbs),
    fat: String(item.fat),
  };
}

function validateForm(
  form: FoodItemFormState,
): Partial<Record<keyof FoodItemFormState, string>> {
  const errors: Partial<Record<keyof FoodItemFormState, string>> = {};

  if (form.name.trim() === '') {
    errors.name = 'Nom requis';
  }

  const quantity = Number(form.baseQuantity);
  if (
    form.baseQuantity.trim() === '' ||
    Number.isNaN(quantity) ||
    quantity <= 0
  ) {
    errors.baseQuantity = 'Supérieur à 0';
  }

  for (const field of ['kcal', 'protein', 'carbs', 'fat'] as const) {
    const value = Number(form[field]);
    if (form[field].trim() === '' || Number.isNaN(value) || value < 0) {
      errors[field] = 'Minimum 0';
    }
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  const [displayedMessage, setDisplayedMessage] = useState(message);

  if (message && message !== displayedMessage) {
    setDisplayedMessage(message);
  }

  useEffect(() => {
    if (message) {
      return;
    }
    const timeoutId = setTimeout(() => setDisplayedMessage(undefined), 100);
    return () => clearTimeout(timeoutId);
  }, [message]);

  if (!displayedMessage) {
    return null;
  }

  return (
    <div
      id={id}
      className={`absolute top-full left-0 z-10 mt-2 ${message ? 'animate-fade-in-up' : 'animate-fade-out'}`}
    >
      <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-t border-l border-red-200 bg-red-50" />
      <div className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs whitespace-nowrap text-red-600 shadow-sm">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {displayedMessage}
      </div>
    </div>
  );
}

interface FoodItemFormProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  editingItem: FoodItem | null;
  onItemAdded: (item: FoodItem) => void;
  onItemUpdated: (item: FoodItem) => void;
  onItemDeleted: (id: number) => void;
}

export default function FoodItemForm({
  dialogRef,
  editingItem,
  onItemAdded,
  onItemUpdated,
  onItemDeleted,
}: FoodItemFormProps) {
  const [form, setForm] = useState<FoodItemFormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FoodItemFormState, boolean>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<
    keyof FoodItemFormState | null
  >(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncedItemId, setSyncedItemId] = useState<number | null>(
    editingItem?.id ?? null,
  );
  const confirmDialogRef = useRef<HTMLDialogElement>(null);

  if ((editingItem?.id ?? null) !== syncedItemId) {
    setSyncedItemId(editingItem?.id ?? null);
    setForm(editingItem ? itemToForm(editingItem) : EMPTY_FORM);
    setTouched({});
    setError(null);
    setSubmitAttempted(false);
  }

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const errors = validateForm(form);

  useEffect(() => {
    if (!submitAttempted) {
      return;
    }
    const timeoutId = setTimeout(() => setSubmitAttempted(false), 5000);
    return () => clearTimeout(timeoutId);
  }, [submitAttempted]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timeoutId = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const handleFocus = (field: keyof FoodItemFormState) => {
    setFocusedField(field);
  };

  const handleBlur = (field: keyof FoodItemFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((current) => (current === field ? null : current));
  };

  const handleChange = (field: keyof FoodItemFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isInvalid = (field: keyof FoodItemFormState) =>
    Boolean(touched[field] && errors[field]);

  const errorMessage = (field: keyof FoodItemFormState) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const allTouched = Object.fromEntries(
      Object.keys(form).map((key) => [key, true]),
    ) as Record<keyof FoodItemFormState, boolean>;
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const input = {
        name: form.name,
        brand: form.brand.trim() === '' ? null : form.brand,
        baseQuantity: Number(form.baseQuantity),
        baseUnit: form.baseUnit,
        kcal: Number(form.kcal),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
      };
      const savedItem = editingItem
        ? await updateFoodItem(editingItem.id, input)
        : await createFoodItem(input);

      if (editingItem) {
        onItemUpdated(savedItem);
      } else {
        onItemAdded(savedItem);
        setForm(EMPTY_FORM);
      }
      setTouched({});
      setSubmitAttempted(false);
      closeDialog();
      setSuccessMessage(
        editingItem
          ? 'Produit modifié avec succès'
          : 'Produit enregistré avec succès',
      );
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Une erreur est survenue, réessayez.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteFoodItem(editingItem.id);
      onItemDeleted(editingItem.id);
      closeDialog();
      setSuccessMessage('Produit supprimé');
    } catch (err: unknown) {
      console.error(err);
      setError('Suppression impossible, réessayez.');
    } finally {
      setIsSubmitting(false);
      confirmDialogRef.current?.close();
    }
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        aria-labelledby="food-dialog-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeDialog();
          }
        }}
        className="dialog-fade m-auto w-[calc(100vw-2rem)] max-w-lg rounded-2xl border-none bg-white p-0 shadow-lg backdrop:backdrop-blur-sm"
      >
        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          autoComplete="off"
          className="flex flex-col gap-5 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <h3
              id="food-dialog-title"
              className="text-lg font-bold text-green-800"
            >
              {editingItem ? 'Modifier un aliment' : 'Ajouter un aliment'}
            </h3>
            <div className="flex items-center gap-3">
              {editingItem && (
                <button
                  type="button"
                  onClick={() => confirmDialogRef.current?.showModal()}
                  aria-label="Supprimer"
                  className="cursor-pointer text-green-400 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Fermer"
                className="cursor-pointer text-green-400 transition-colors hover:text-green-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-200 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
          >
            <ScanBarcode className="h-4 w-4" />
            Scanner un produit
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:gap-3">
            <div className="relative flex flex-col gap-1.5 sm:flex-1">
              <label
                htmlFor="food-name"
                className="text-xs font-semibold tracking-wide text-green-500 uppercase"
              >
                Nom
              </label>
              <input
                id="food-name"
                type="text"
                placeholder="Ex : Riz blanc"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                aria-invalid={isInvalid('name')}
                aria-describedby="food-name-error"
                className={INPUT_CLASS}
              />
              <FieldError id="food-name-error" message={errorMessage('name')} />
            </div>

            <div className="relative flex flex-col gap-1.5 sm:flex-1">
              <label
                htmlFor="food-brand"
                className="text-xs font-semibold tracking-wide text-green-500 uppercase"
              >
                Marque (optionnel)
              </label>
              <input
                id="food-brand"
                type="text"
                placeholder="Ex : Knorr"
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label
              htmlFor="food-quantity"
              className="text-xs font-semibold tracking-wide text-green-500 uppercase"
            >
              Quantité de référence
            </label>
            <div className="flex gap-2">
              <input
                id="food-quantity"
                type="text"
                inputMode="decimal"
                placeholder="Ex : 100"
                value={form.baseQuantity}
                onChange={(e) => handleChange('baseQuantity', e.target.value)}
                onFocus={() => handleFocus('baseQuantity')}
                onBlur={() => handleBlur('baseQuantity')}
                aria-invalid={isInvalid('baseQuantity')}
                aria-describedby="food-quantity-error"
                className={INPUT_CLASS}
              />
              <div className="flex gap-1.5 rounded-xl border border-green-200 bg-white p-1.5">
                {UNIT_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-green-500 transition-colors has-checked:animate-pill-select has-checked:bg-green-500 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-400"
                  >
                    <input
                      type="radio"
                      name="baseUnit"
                      value={value}
                      checked={form.baseUnit === value}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, baseUnit: value }))
                      }
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <FieldError
              id="food-quantity-error"
              message={errorMessage('baseQuantity')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold tracking-wide text-green-500 uppercase">
              Valeurs nutritionnelles (pour cette quantité)
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MACRO_FIELDS.map(({ field, label }) => (
                <div key={field} className="relative flex flex-col gap-1">
                  <label
                    htmlFor={`food-${field}`}
                    className="text-xs text-green-500"
                  >
                    {label}
                  </label>
                  <input
                    id={`food-${field}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onFocus={() => handleFocus(field)}
                    onBlur={() => handleBlur(field)}
                    aria-invalid={isInvalid(field)}
                    aria-describedby={`food-${field}-error`}
                    className={INPUT_CLASS}
                  />
                  <FieldError
                    id={`food-${field}-error`}
                    message={errorMessage(field)}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </dialog>

      <dialog
        ref={confirmDialogRef}
        aria-labelledby="confirm-delete-title"
        className="dialog-fade m-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl border-none bg-white p-6 shadow-lg backdrop:backdrop-blur-sm"
      >
        <h3
          id="confirm-delete-title"
          className="text-lg font-bold text-green-800"
        >
          Supprimer cet aliment ?
        </h3>
        <p className="mt-2 text-sm text-green-500">
          {editingItem?.name} sera retiré de ta liste.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => confirmDialogRef.current?.close()}
            className="flex-1 cursor-pointer rounded-xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </dialog>

      <Toast message={successMessage} icon={CheckCircle2} />
    </>
  );
}
