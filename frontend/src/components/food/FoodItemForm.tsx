import { useRef, useState, type RefObject } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { useTimeout } from '../../hooks/useTimeout';
import { hasTooManyDecimals, TOO_MANY_DECIMALS } from '../../utils/decimals';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';
import { PillTabs } from '../ui/PillTabs';
import { Toast } from '../ui/Toast';
import { createFoodItem, deleteFoodItem, updateFoodItem } from './api';
import BarcodeField from './BarcodeField';
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
  } else if (hasTooManyDecimals(form.baseQuantity)) {
    errors.baseQuantity = TOO_MANY_DECIMALS;
  }

  for (const field of ['kcal', 'protein', 'carbs', 'fat'] as const) {
    const value = Number(form[field]);
    if (form[field].trim() === '' || Number.isNaN(value) || value < 0) {
      errors[field] = 'Minimum 0';
    } else if (hasTooManyDecimals(form[field])) {
      errors[field] = TOO_MANY_DECIMALS;
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
  const [barcodeFieldKey, setBarcodeFieldKey] = useState(0);
  const [syncedItemId, setSyncedItemId] = useState<number | null>(
    editingItem?.id ?? null,
  );
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const duplicateDialogRef = useRef<HTMLDialogElement>(null);

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

  const handleProduct = (product: OffProduct) => {
    setForm(productToForm(product));
    setTouched({});
    setSubmitAttempted(false);
    setError(null);
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
        setBarcodeFieldKey((key) => key + 1);
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
      setError(requestErrorMessage(err, 'Une erreur est survenue, réessayez.'));
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
    } catch {
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
            <BarcodeField
              key={barcodeFieldKey}
              value={form.barcode}
              error={errors.barcode}
              showError={submitAttempted}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, barcode: value }))
              }
              onProduct={handleProduct}
            />
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
            ? `${duplicates.length} aliments existent déjà avec ce code-barres. En ajouter un autre ?`
            : `« ${duplicates[0]?.name ?? ''} » existe déjà avec ce code-barres. L'ajouter quand même ?`
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
