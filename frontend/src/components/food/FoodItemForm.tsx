import { useRef, useState, type RefObject } from 'react';
import { Trash2 } from 'lucide-react';

import { useCurrentUser } from '../../auth/authContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import {
  hasTooManyDecimals,
  parseDecimal,
  TOO_MANY_DECIMALS,
} from '../../utils/decimals';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { MAX_LENGTH, maxLengthMessage } from '../../utils/validation';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FieldError } from '../ui/FieldError';
import { LABEL_CLASS } from '../ui/fieldStyle';
import { Input } from '../ui/Input';
import { PillTabs } from '../ui/PillTabs';
import { useToast } from '../ui/toastContext';
import { createFoodItem, deleteFoodItem, updateFoodItem } from './api';
import { BarcodeField } from './BarcodeField';
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

/** Fills the form with the food being edited. */
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

/**
 * Leading zeros do not count: the same product can be written with or without
 * them (EAN-13 and UPC-A).
 */
const significantDigits = (barcode: string) => barcode.replace(/^0+/, '');

/**
 * Fills the form with an Open Food Facts product; the values they lack stay
 * empty.
 */
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

/**
 * Name required, name and brand within the backend limits, base quantity above
 * 0, macros 0 or more, 2 decimals at most. The barcode is optional.
 */
function validateForm(
  form: FoodItemFormState,
): Partial<Record<keyof FoodItemFormState, string>> {
  const errors: Partial<Record<keyof FoodItemFormState, string>> = {};

  const barcode = form.barcode.trim();
  if (barcode !== '' && !/^\d{8,14}$/.test(barcode)) {
    errors.barcode = '8 à 14 chiffres';
  }

  const name = form.name.trim();
  if (name === '') {
    errors.name = 'Nom requis';
  } else if (name.length > MAX_LENGTH.foodName) {
    errors.name = maxLengthMessage(MAX_LENGTH.foodName);
  }

  if (form.brand.trim().length > MAX_LENGTH.brand) {
    errors.brand = maxLengthMessage(MAX_LENGTH.brand);
  }

  const quantity = parseDecimal(form.baseQuantity);
  if (quantity === null || Number.isNaN(quantity) || quantity <= 0) {
    errors.baseQuantity = 'Supérieur à 0';
  } else if (hasTooManyDecimals(form.baseQuantity)) {
    errors.baseQuantity = TOO_MANY_DECIMALS;
  }

  for (const field of ['kcal', 'protein', 'carbs', 'fat'] as const) {
    const value = parseDecimal(form[field]);
    if (value === null || Number.isNaN(value) || value < 0) {
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

/**
 * Dialog to create or edit a food: barcode lookup, name, brand, base quantity
 * and macros. It warns before adding a second food with the same barcode.
 * Deleting archives the food.
 */
export function FoodItemForm({
  dialogRef,
  editingItem,
  foodItems,
  onItemAdded,
  onItemUpdated,
  onItemDeleted,
}: FoodItemFormProps) {
  const { userId } = useCurrentUser();
  const {
    form,
    setForm,
    errors,
    submitAttempted,
    handleFocus,
    handleBlur,
    handleChange,
    isInvalid,
    errorMessage,
    attemptSubmit,
    resetValidation,
  } = useFormValidation(EMPTY_FORM, validateForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();
  const [barcodeFieldKey, setBarcodeFieldKey] = useState(0);
  const [syncedItemId, setSyncedItemId] = useState<number | null>(
    editingItem?.id ?? null,
  );
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const duplicateDialogRef = useRef<HTMLDialogElement>(null);

  // Updating state during render, the React way to react to a prop change
  // without an effect: when the dialog opens on another food, the form is
  // refilled before it is displayed.
  if ((editingItem?.id ?? null) !== syncedItemId) {
    setSyncedItemId(editingItem?.id ?? null);
    setForm(editingItem ? itemToForm(editingItem) : EMPTY_FORM);
    resetValidation();
    setError(null);
  }

  const closeDialog = () => {
    dialogRef.current?.close();
  };

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

  const handleProduct = (product: OffProduct) => {
    setForm(productToForm(product));
    resetValidation();
    setError(null);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!attemptSubmit()) {
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
        baseQuantity: parseDecimal(form.baseQuantity) ?? 0,
        baseUnit: form.baseUnit,
        kcal: parseDecimal(form.kcal) ?? 0,
        protein: parseDecimal(form.protein) ?? 0,
        carbs: parseDecimal(form.carbs) ?? 0,
        fat: parseDecimal(form.fat) ?? 0,
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
      resetValidation();
      closeDialog();
      showToast(
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
      showToast('Produit supprimé');
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
                maxLength={MAX_LENGTH.foodName}
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
                maxLength={MAX_LENGTH.brand}
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                onFocus={() => handleFocus('brand')}
                onBlur={() => handleBlur('brand')}
                aria-invalid={isInvalid('brand')}
                aria-describedby="food-brand-error"
              />
              <FieldError
                id="food-brand-error"
                message={errorMessage('brand')}
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
        description={`${editingItem?.name ?? ''} sera retiré de votre liste.`}
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
    </>
  );
}
