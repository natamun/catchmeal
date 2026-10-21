import { useRef, useState, type RefObject } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Trash2 } from 'lucide-react';

import { useCurrentUser } from '../../auth/authContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useTimeout } from '../../hooks/useTimeout';
import { parseDecimal } from '../../utils/decimals';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { MAX_LENGTH, maxLengthMessage } from '../../utils/validation';
import type { FoodItem } from '../food/types';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DropdownPanel } from '../ui/DropdownPanel';
import { FieldError } from '../ui/FieldError';
import { LABEL_CLASS } from '../ui/fieldStyle';
import { Input } from '../ui/Input';
import { MacroSummary } from '../ui/MacroSummary';
import { useToast } from '../ui/toastContext';
import { createMeal, deleteMeal, updateMeal } from './api';
import {
  draftsToInput,
  draftTotals,
  mealToItems,
  type MealItemDraft,
} from './draft';
import { DraftItemList } from './DraftItemList';
import {
  EMPTY_QUICK_ADD_FORM,
  QUICK_ADD_FIELDS,
  validateQuickAddForm,
} from './quickMealAdd';
import type { Meal, MealInput } from './types';

interface MealFormProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  foodItems: FoodItem[];
  editingMeal: Meal | null;
  onMealAdded: (meal: Meal) => void;
  onMealUpdated: (meal: Meal) => void;
  onMealDeleted: (id: number) => void;
}

/**
 * Dialog to create or edit a library meal: a name, foods searched in the
 * library with their quantity, and quick adds.
 */
export function MealForm({
  dialogRef,
  foodItems,
  editingMeal,
  onMealAdded,
  onMealUpdated,
  onMealDeleted,
}: MealFormProps) {
  const { userId } = useCurrentUser();
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [items, setItems] = useState<MealItemDraft[]>([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const quickAdd = useFormValidation(
    EMPTY_QUICK_ADD_FORM,
    validateQuickAddForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();
  const [syncedMealId, setSyncedMealId] = useState<number | null>(
    editingMeal?.id ?? null,
  );
  const confirmDialogRef = useRef<HTMLDialogElement>(null);

  // Updating state during render, the React way to react to a prop change
  // without an effect: when the dialog opens on another meal, the form is
  // refilled before it is displayed.
  if ((editingMeal?.id ?? null) !== syncedMealId) {
    setSyncedMealId(editingMeal?.id ?? null);
    setName(editingMeal?.name ?? '');
    setItems(editingMeal ? mealToItems(editingMeal, foodItems) : []);
    setNameTouched(false);
    setSubmitAttempted(false);
    setError(null);
  }

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);

  const trimmedName = name.trim();
  const nameError =
    trimmedName === ''
      ? 'Nom requis'
      : trimmedName.length > MAX_LENGTH.mealName
        ? maxLengthMessage(MAX_LENGTH.mealName)
        : undefined;
  const showNameError =
    nameTouched && (nameFocused || submitAttempted) ? nameError : undefined;
  const itemsError = items.length === 0 ? 'Minimum un aliment' : undefined;

  const query = search.trim().toLowerCase();
  const searchResults = query
    ? foodItems.filter(
        (foodItem) =>
          !foodItem.archived &&
          !items.some(
            (item) => item.kind === 'food' && item.foodItem.id === foodItem.id,
          ) &&
          (foodItem.name.toLowerCase().includes(query) ||
            foodItem.brand?.toLowerCase().includes(query)),
      )
    : [];
  const isSearchOpen = searchFocused && searchResults.length > 0;

  const rawTotals = draftTotals(items);

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const addItem = (foodItem: FoodItem) => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        kind: 'food',
        foodItem,
        quantity: foodItem.baseQuantity,
      },
    ]);
    setSearch('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const adjustQuantity = (id: string, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const addQuickItem = () => {
    if (!quickAdd.attemptSubmit()) {
      return;
    }

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        kind: 'quick',
        quantity: 1,
        kcal: parseDecimal(quickAdd.form.kcal) ?? 0,
        protein: parseDecimal(quickAdd.form.protein) ?? 0,
        carbs: parseDecimal(quickAdd.form.carbs) ?? 0,
        fat: parseDecimal(quickAdd.form.fat) ?? 0,
      },
    ]);
    quickAdd.setForm(EMPTY_QUICK_ADD_FORM);
    quickAdd.resetValidation();
    setQuickAddOpen(false);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNameTouched(true);

    if (nameError || itemsError) {
      setSubmitAttempted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const input: MealInput = {
        name,
        items: draftsToInput(items),
      };
      const savedMeal = editingMeal
        ? await updateMeal(userId, editingMeal.id, input)
        : await createMeal(userId, input);

      if (editingMeal) {
        onMealUpdated(savedMeal);
      } else {
        onMealAdded(savedMeal);
        setName('');
        setItems([]);
      }
      setNameTouched(false);
      setSubmitAttempted(false);
      closeDialog();
      showToast(
        editingMeal
          ? 'Repas modifié avec succès'
          : 'Repas enregistré avec succès',
      );
    } catch (err: unknown) {
      setError(requestErrorMessage(err, 'Une erreur est survenue, réessayez.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingMeal) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteMeal(userId, editingMeal.id);
      onMealDeleted(editingMeal.id);
      closeDialog();
      showToast('Repas supprimé');
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
        title={editingMeal ? 'Modifier un repas' : 'Ajouter un repas'}
        onDialogNode={setDialogNode}
        headerActions={
          editingMeal && (
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
          <div className="relative flex flex-col gap-1.5">
            <label htmlFor="meal-name" className={LABEL_CLASS}>
              Nom
            </label>
            <Input
              id="meal-name"
              type="text"
              placeholder="Ex : Poulet riz"
              maxLength={MAX_LENGTH.mealName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => {
                setNameFocused(false);
                setNameTouched(true);
              }}
              aria-invalid={nameTouched && Boolean(nameError)}
              aria-describedby="meal-name-error"
              autoComplete="off"
            />
            <FieldError id="meal-name-error" message={showNameError} />
          </div>

          <Popover.Root open={isSearchOpen} onOpenChange={() => {}}>
            <Popover.Anchor className="relative flex flex-col gap-1.5">
              <Popover.Root open={quickAddOpen} onOpenChange={setQuickAddOpen}>
                <Popover.Anchor className="flex w-full items-center justify-between">
                  <label htmlFor="meal-item-search" className={LABEL_CLASS}>
                    Ajouter un aliment
                  </label>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-medium text-green-500 underline-offset-2 hover:underline"
                    >
                      {quickAddOpen ? 'Annuler' : 'Ajout rapide'}
                    </button>
                  </Popover.Trigger>
                </Popover.Anchor>
                {dialogNode && (
                  <Popover.Portal container={dialogNode}>
                    <Popover.Content
                      align="end"
                      sideOffset={3}
                      className="z-10 w-(--radix-popover-trigger-width) rounded-xl border border-green-200 bg-white p-3 shadow-md data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in-up"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {QUICK_ADD_FIELDS.map(({ field, label }) => (
                            <div
                              key={field}
                              className="relative flex flex-col gap-1"
                            >
                              <label
                                htmlFor={`quick-${field}`}
                                className="text-xs text-green-500"
                              >
                                {label}
                              </label>
                              <Input
                                id={`quick-${field}`}
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={quickAdd.form[field]}
                                onChange={(e) =>
                                  quickAdd.handleChange(field, e.target.value)
                                }
                                onFocus={() => quickAdd.handleFocus(field)}
                                onBlur={() => quickAdd.handleBlur(field)}
                                aria-invalid={quickAdd.isInvalid(field)}
                                aria-describedby={`quick-${field}-error`}
                                autoComplete="off"
                              />
                              <FieldError
                                id={`quick-${field}-error`}
                                message={quickAdd.errorMessage(field)}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={addQuickItem}
                          className="w-full cursor-pointer rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                        >
                          Ajouter
                        </button>
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                )}
              </Popover.Root>
              <Input
                id="meal-item-search"
                type="text"
                placeholder="Rechercher un aliment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-invalid={submitAttempted && Boolean(itemsError)}
                aria-describedby="meal-items-error"
                autoComplete="off"
              />
              <FieldError
                id="meal-items-error"
                message={submitAttempted ? itemsError : undefined}
              />
            </Popover.Anchor>
            <DropdownPanel container={dialogNode} matchAnchorWidth>
              {searchResults.map((foodItem) => (
                <button
                  key={foodItem.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addItem(foodItem)}
                  className="flex w-full cursor-pointer items-center justify-between border-t border-green-100 px-4 py-2 text-left text-sm text-green-800 transition-colors first:border-t-0 hover:bg-green-50"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {foodItem.name}
                  </span>
                  <span className="shrink-0 text-xs text-green-500">
                    {foodItem.kcal} kcal
                  </span>
                </button>
              ))}
            </DropdownPanel>
          </Popover.Root>

          {items.length > 0 && (
            <DraftItemList
              items={items}
              onAdjust={adjustQuantity}
              onRemove={removeItem}
              className="border-t border-green-100 pt-5"
            />
          )}

          <div className="flex flex-col gap-3 border-t border-green-100 pt-5">
            {items.length > 0 && <MacroSummary totals={rawTotals} />}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </BaseDialog>

      <ConfirmDialog
        dialogRef={confirmDialogRef}
        title="Supprimer ce repas ?"
        description={`${editingMeal?.name ?? 'Ce repas'} sera retiré de votre liste.`}
        confirmLabel="Supprimer"
        pendingLabel="Suppression..."
        isPending={isSubmitting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
