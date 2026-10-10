import { useRef, useState, type RefObject } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  ScanBarcode,
  Search,
  Trash2,
} from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { useTimeout } from '../../hooks/useTimeout';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';
import { PillTabs } from '../ui/PillTabs';
import { Toast } from '../ui/Toast';
import {
  ApiError,
  createFoodItem,
  deleteFoodItem,
  lookupOffProduct,
  updateFoodItem,
} from './api';
import type { FoodItem, OffProduct, QuantityUnit } from './types';

interface FoodItemFormState {
  barcode: string;
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
  barcode: '',
  name: '',
  brand: '',
  baseQuantity: '',
  baseUnit: 'GRAM',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
};

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

const ICON_BUTTON_CLASS =
  'flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-green-200 text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60';

const OFF_URL = 'https://world.openfoodfacts.org';

const LOOKUP_ERRORS: Record<number, string> = {
  400: 'Code-barres invalide',
  404: 'Produit introuvable',
  429: 'Trop de recherches, patientez 1 min',
  503: 'Open Food Facts ne répond pas',
};

const UNIT_OPTIONS = [
  { value: 'GRAM', label: 'g' },
  { value: 'MILLILITER', label: 'ml' },
  { value: 'PIECE', label: 'pièce' },
] as const;

const MACRO_FIELDS = [
  { field: 'kcal', label: 'Kcal' },
  { field: 'protein', label: 'Protéines (g)' },
  { field: 'carbs', label: 'Glucides (g)' },
  { field: 'fat', label: 'Lipides (g)' },
] as const;

function itemToForm(item: FoodItem): FoodItemFormState {
  return {
    barcode: item.barcode ?? '',
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

const significantDigits = (barcode: string) => barcode.replace(/^0+/, '');

function productToForm(product: OffProduct): FoodItemFormState {
  const toField = (value: number | null) =>
    value === null ? '' : String(value);

  return {
    barcode: product.barcode,
    name: product.name ?? '',
    brand: product.brand ?? '',
    baseQuantity: String(product.baseQuantity),
    baseUnit: product.baseUnit,
    kcal: toField(product.kcal),
    protein: toField(product.protein),
    carbs: toField(product.carbs),
    fat: toField(product.fat),
  };
}

function validateForm(
  form: FoodItemFormState,
): Partial<Record<keyof FoodItemFormState, string>> {
  const errors: Partial<Record<keyof FoodItemFormState, string>> = {};

  const barcode = form.barcode.trim();
  if (barcode !== '' && !/^\d{8,14}$/.test(barcode)) {
    errors.barcode = '8 à 14 chiffres';
  }

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

interface FoodItemFormProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  editingItem: FoodItem | null;
  foodItems: FoodItem[];
  onItemAdded: (item: FoodItem) => void;
  onItemUpdated: (item: FoodItem) => void;
  onItemDeleted: (id: number) => void;
}

export default function FoodItemForm({
  dialogRef,
  editingItem,
  foodItems,
  onItemAdded,
  onItemUpdated,
  onItemDeleted,
}: FoodItemFormProps) {
  const { user } = useAuth();
  const userId = user!.userId;
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
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [foundBarcode, setFoundBarcode] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<{
    message: string;
    onField: boolean;
  } | null>(null);
  const [syncedItemId, setSyncedItemId] = useState<number | null>(
    editingItem?.id ?? null,
  );
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const duplicateDialogRef = useRef<HTMLDialogElement>(null);

  if ((editingItem?.id ?? null) !== syncedItemId) {
    setSyncedItemId(editingItem?.id ?? null);
    setForm(editingItem ? itemToForm(editingItem) : EMPTY_FORM);
    setTouched({});
    setError(null);
    setLookupError(null);
    setFoundBarcode(null);
    setSubmitAttempted(false);
  }

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const errors = validateForm(form);

  const barcode = form.barcode.trim();
  const duplicates =
    editingItem || barcode === ''
      ? []
      : foodItems.filter(
          (item) =>
            !item.archived &&
            item.barcode !== null &&
            significantDigits(item.barcode) === significantDigits(barcode),
        );

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);
  useTimeout(() => setSuccessMessage(null), successMessage ? 3000 : null);
  useTimeout(() => setLookupError(null), lookupError ? 5000 : null);

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

  const handleLookup = async () => {
    if (barcode === '' || isLookingUp) {
      return;
    }
    setLookupError(null);
    if (errors.barcode) {
      setTouched((prev) => ({ ...prev, barcode: true }));
      barcodeRef.current?.focus();
      return;
    }

    setIsLookingUp(true);
    try {
      const product = await lookupOffProduct(userId, barcode);
      setForm(productToForm(product));
      setFoundBarcode(product.barcode);
      setTouched({});
      setSubmitAttempted(false);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      const status = err instanceof ApiError ? (err.status ?? 0) : 0;
      setLookupError({
        message: LOOKUP_ERRORS[status] ?? 'Une erreur est survenue',
        onField: status === 400,
      });
    } finally {
      setIsLookingUp(false);
    }
  };

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
    if (duplicates.length > 0) {
      duplicateDialogRef.current?.showModal();
      return;
    }

    await save();
  };

  const save = async () => {
    setIsSubmitting(true);
    try {
      const input = {
        name: form.name,
        brand: form.brand.trim() === '' ? null : form.brand,
        barcode: barcode === '' ? null : barcode,
        baseQuantity: Number(form.baseQuantity),
        baseUnit: form.baseUnit,
        kcal: Number(form.kcal),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
      };
      const savedItem = editingItem
        ? await updateFoodItem(userId, editingItem.id, input)
        : await createFoodItem(userId, input);

      if (editingItem) {
        onItemUpdated(savedItem);
      } else {
        onItemAdded(savedItem);
        setForm(EMPTY_FORM);
        setLookupError(null);
        setFoundBarcode(null);
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
      duplicateDialogRef.current?.close();
    }
  };

  const handleDelete = async () => {
    if (!editingItem) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteFoodItem(userId, editingItem.id);
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
      <BaseDialog
        dialogRef={dialogRef}
        title={editingItem ? 'Modifier un aliment' : 'Ajouter un aliment'}
        headerActions={
          editingItem && (
            <button
              type="button"
              onClick={() => confirmDialogRef.current?.showModal()}
              aria-label="Supprimer"
              className="cursor-pointer text-green-400 transition-colors hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )
        }
      >
        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          autoComplete="off"
          className="contents"
        >
          {!editingItem && (
            <div className="relative flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="food-barcode" className={LABEL_CLASS}>
                  Code-barres (optionnel)
                </label>
                <a
                  href={
                    foundBarcode !== null && foundBarcode === barcode
                      ? `${OFF_URL}/product/${foundBarcode}`
                      : OFF_URL
                  }
                  target="_blank"
                  rel="noreferrer"
                  title="Données fournies par Open Food Facts"
                  className="flex shrink-0 items-center gap-1 text-xs text-green-500 transition-colors hover:text-green-700"
                >
                  <span>
                    via{' '}
                    <span className="max-[400px]:hidden">Open Food Facts</span>
                    <span className="min-[401px]:hidden">OFF</span>
                  </span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Input
                  id="food-barcode"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex : 7612100018477"
                  ref={barcodeRef}
                  value={form.barcode}
                  readOnly={isLookingUp}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, barcode: e.target.value }));
                    setLookupError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleLookup();
                    }
                  }}
                  onFocus={() => handleFocus('barcode')}
                  onBlur={() => handleBlur('barcode')}
                  aria-invalid={isInvalid('barcode') || lookupError?.onField}
                  aria-describedby="food-barcode-error"
                />
                <button
                  type="button"
                  disabled={isLookingUp}
                  aria-label="Scanner un code-barres"
                  className={ICON_BUTTON_CLASS}
                >
                  <ScanBarcode className="h-4 w-4" />
                </button>
                <div className="relative flex shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleLookup()}
                    disabled={form.barcode.trim() === '' || isLookingUp}
                    aria-label="Rechercher le produit"
                    aria-describedby="food-lookup-error"
                    className={ICON_BUTTON_CLASS}
                  >
                    {isLookingUp ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                  <FieldError
                    id="food-lookup-error"
                    align="right"
                    message={
                      lookupError && !lookupError.onField
                        ? lookupError.message
                        : undefined
                    }
                  />
                </div>
              </div>
              <FieldError
                id="food-barcode-error"
                message={
                  lookupError?.onField
                    ? lookupError.message
                    : errorMessage('barcode')
                }
              />
            </div>
          )}

          <div className="flex flex-col gap-5 sm:flex-row sm:gap-3">
            <div className="relative flex flex-col gap-1.5 sm:flex-1">
              <label htmlFor="food-name" className={LABEL_CLASS}>
                Nom
              </label>
              <Input
                id="food-name"
                type="text"
                placeholder="Ex : Riz blanc"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                aria-invalid={isInvalid('name')}
                aria-describedby="food-name-error"
              />
              <FieldError id="food-name-error" message={errorMessage('name')} />
            </div>

            <div className="relative flex flex-col gap-1.5 sm:flex-1">
              <label htmlFor="food-brand" className={LABEL_CLASS}>
                Marque (optionnel)
              </label>
              <Input
                id="food-brand"
                type="text"
                placeholder="Ex : Knorr"
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label htmlFor="food-quantity" className={LABEL_CLASS}>
              Quantité de référence
            </label>
            <div className="flex gap-2">
              <Input
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
              />
              <PillTabs
                name="baseUnit"
                options={UNIT_OPTIONS}
                value={form.baseUnit}
                onChange={(baseUnit) =>
                  setForm((prev) => ({ ...prev, baseUnit }))
                }
              />
            </div>
            <FieldError
              id="food-quantity-error"
              message={errorMessage('baseQuantity')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className={LABEL_CLASS}>
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
                  <Input
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
      </BaseDialog>

      <ConfirmDialog
        dialogRef={confirmDialogRef}
        title="Supprimer cet aliment ?"
        description={`${editingItem?.name ?? ''} sera retiré de ta liste.`}
        confirmLabel="Supprimer"
        pendingLabel="Suppression..."
        isPending={isSubmitting}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        dialogRef={duplicateDialogRef}
        title="Aliment déjà enregistré"
        description={
          duplicates.length > 1
            ? `Tu as déjà ${duplicates.length} aliments avec ce code-barres. En ajouter un autre ?`
            : `Tu as déjà « ${duplicates[0]?.name ?? ''} » avec ce code-barres. L'ajouter quand même ?`
        }
        confirmLabel="Ajouter"
        pendingLabel="Enregistrement..."
        isPending={isSubmitting}
        onConfirm={() => void save()}
        tone="primary"
      />

      <Toast message={successMessage} icon={CheckCircle2} />
    </>
  );
}
