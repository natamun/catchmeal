import { useRef, useState, type RefObject } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CheckCircle2, Trash2, X } from 'lucide-react';

import { useTimeout } from '../../hooks/useTimeout';
import type { FoodItem } from '../food/types';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DropdownPanel } from '../ui/DropdownPanel';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';
import { Toast } from '../ui/Toast';
import { ApiError, createMeal, deleteMeal, updateMeal } from './api';
import type { Meal, MealInput } from './types';

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

type QuickAddField = 'kcal' | 'protein' | 'carbs' | 'fat';

const QUICK_ADD_FIELDS: { field: QuickAddField; label: string }[] = [
  { field: 'kcal', label: 'Kcal' },
  { field: 'protein', label: 'Protéines (g)' },
  { field: 'carbs', label: 'Glucides (g)' },
  { field: 'fat', label: 'Lipides (g)' },
];

const EMPTY_QUICK_ADD_FORM: Record<QuickAddField, string> = {
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
};

function MacroBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span
      title={`${label} : ${value}g`}
      className="flex items-center gap-1 text-xs font-semibold text-green-700"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${color}`} />
      {value}
    </span>
  );
}

function validateQuickAddForm(
  form: Record<QuickAddField, string>,
): Partial<Record<QuickAddField, string>> {
  const errors: Partial<Record<QuickAddField, string>> = {};

  for (const { field } of QUICK_ADD_FIELDS) {
    const value = Number(form[field]);
    if (form[field].trim() === '' || Number.isNaN(value) || value < 0) {
      errors[field] = 'Minimum 0';
    }
  }

  return errors;
}

type MealItemDraft =
  | { id: string; kind: 'food'; foodItem: FoodItem; quantity: number }
  | {
      id: string;
      kind: 'quick';
      quantity: number;
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
    };

function mealToItems(meal: Meal, foodItems: FoodItem[]): MealItemDraft[] {
  const drafts: MealItemDraft[] = [];

  for (const item of meal.items) {
    if (item.foodItemId === null) {
      drafts.push({
        id: crypto.randomUUID(),
        kind: 'quick',
        quantity: item.quantity,
        kcal: item.kcal,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
      continue;
    }

    const foodItem = foodItems.find((f) => f.id === item.foodItemId);
    if (!foodItem) {
      continue;
    }

    drafts.push({
      id: crypto.randomUUID(),
      kind: 'food',
      foodItem,
      quantity: item.quantity,
    });
  }

  return drafts;
}

interface MealFormProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  foodItems: FoodItem[];
  editingMeal: Meal | null;
  onMealAdded: (meal: Meal) => void;
  onMealUpdated: (meal: Meal) => void;
  onMealDeleted: (id: number) => void;
}

export default function MealForm({
  dialogRef,
  foodItems,
  editingMeal,
  onMealAdded,
  onMealUpdated,
  onMealDeleted,
}: MealFormProps) {
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [items, setItems] = useState<MealItemDraft[]>([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState(EMPTY_QUICK_ADD_FORM);
  const [quickAddTouched, setQuickAddTouched] = useState<
    Partial<Record<QuickAddField, boolean>>
  >({});
  const [quickAddFocusedField, setQuickAddFocusedField] =
    useState<QuickAddField | null>(null);
  const [quickAddSubmitAttempted, setQuickAddSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncedMealId, setSyncedMealId] = useState<number | null>(
    editingMeal?.id ?? null,
  );
  const confirmDialogRef = useRef<HTMLDialogElement>(null);

  if ((editingMeal?.id ?? null) !== syncedMealId) {
    setSyncedMealId(editingMeal?.id ?? null);
    setName(editingMeal?.name ?? '');
    setItems(editingMeal ? mealToItems(editingMeal, foodItems) : []);
    setNameTouched(false);
    setSubmitAttempted(false);
    setError(null);
  }

  useTimeout(
    () => setQuickAddSubmitAttempted(false),
    quickAddSubmitAttempted ? 5000 : null,
  );
  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);
  useTimeout(() => setSuccessMessage(null), successMessage ? 3000 : null);

  const nameError = name.trim() === '' ? 'Nom requis' : undefined;
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

  const rawTotals = items.reduce(
    (acc, item) => {
      if (item.kind === 'food') {
        const scale = item.quantity / item.foodItem.baseQuantity;
        return {
          kcal: acc.kcal + item.foodItem.kcal * scale,
          protein: acc.protein + item.foodItem.protein * scale,
          carbs: acc.carbs + item.foodItem.carbs * scale,
          fat: acc.fat + item.foodItem.fat * scale,
        };
      }
      return {
        kcal: acc.kcal + item.kcal,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const totalMacros = [
    {
      label: 'Protéines',
      value: Math.round(rawTotals.protein * 10) / 10,
      color: 'bg-rose-400',
    },
    {
      label: 'Glucides',
      value: Math.round(rawTotals.carbs * 10) / 10,
      color: 'bg-amber-400',
    },
    {
      label: 'Lipides',
      value: Math.round(rawTotals.fat * 10) / 10,
      color: 'bg-blue-400',
    },
  ];

  const quickAddErrors = validateQuickAddForm(quickAddForm);

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

  const handleQuickAddFocus = (field: QuickAddField) => {
    setQuickAddFocusedField(field);
  };

  const handleQuickAddBlur = (field: QuickAddField) => {
    setQuickAddTouched((prev) => ({ ...prev, [field]: true }));
    setQuickAddFocusedField((current) => (current === field ? null : current));
  };

  const handleQuickAddChange = (field: QuickAddField, value: string) => {
    setQuickAddForm((prev) => ({ ...prev, [field]: value }));
    setQuickAddTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isQuickAddInvalid = (field: QuickAddField) =>
    Boolean(quickAddTouched[field] && quickAddErrors[field]);

  const quickAddErrorMessage = (field: QuickAddField) =>
    quickAddTouched[field] &&
    (quickAddFocusedField === field || quickAddSubmitAttempted)
      ? quickAddErrors[field]
      : undefined;

  const addQuickItem = () => {
    const allTouched = Object.fromEntries(
      QUICK_ADD_FIELDS.map(({ field }) => [field, true]),
    ) as Record<QuickAddField, boolean>;
    setQuickAddTouched(allTouched);

    if (Object.keys(quickAddErrors).length > 0) {
      setQuickAddSubmitAttempted(true);
      return;
    }

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        kind: 'quick',
        quantity: 1,
        kcal: Number(quickAddForm.kcal),
        protein: Number(quickAddForm.protein),
        carbs: Number(quickAddForm.carbs),
        fat: Number(quickAddForm.fat),
      },
    ]);
    setQuickAddForm(EMPTY_QUICK_ADD_FORM);
    setQuickAddTouched({});
    setQuickAddSubmitAttempted(false);
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
        items: items.map((item) =>
          item.kind === 'food'
            ? { foodItemId: item.foodItem.id, quantity: item.quantity }
            : {
                quantity: item.quantity,
                kcal: item.kcal,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
              },
        ),
      };
      const savedMeal = editingMeal
        ? await updateMeal(editingMeal.id, input)
        : await createMeal(input);

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
      setSuccessMessage(
        editingMeal
          ? 'Repas modifié avec succès'
          : 'Repas enregistré avec succès',
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
    if (!editingMeal) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteMeal(editingMeal.id);
      onMealDeleted(editingMeal.id);
      closeDialog();
      setSuccessMessage('Repas supprimé');
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
                                value={quickAddForm[field]}
                                onChange={(e) =>
                                  handleQuickAddChange(field, e.target.value)
                                }
                                onFocus={() => handleQuickAddFocus(field)}
                                onBlur={() => handleQuickAddBlur(field)}
                                aria-invalid={isQuickAddInvalid(field)}
                                aria-describedby={`quick-${field}-error`}
                                autoComplete="off"
                              />
                              <FieldError
                                id={`quick-${field}-error`}
                                message={quickAddErrorMessage(field)}
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
            <ul className="flex flex-col gap-2 border-t border-green-100 pt-5">
              {items.map((item) => {
                if (item.kind === 'quick') {
                  return (
                    <li
                      key={item.id}
                      className="flex animate-fade-in-up items-center gap-2 rounded-xl border border-green-200 px-3 py-1.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-green-800">
                        {item.kcal} kcal
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Retirer cet ajout rapide"
                        className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                }

                const { foodItem, quantity } = item;
                const unitLabel = foodItem.baseUnit === 'GRAM' ? 'g' : 'x';
                const stepButtonClass =
                  'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-green-50 text-xs font-bold text-green-600 transition-colors hover:bg-green-100';

                return (
                  <li
                    key={item.id}
                    className="flex animate-fade-in-up items-center gap-2 rounded-xl border border-green-200 px-3 py-1.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-green-800">
                      {foodItem.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5 select-none">
                      <button
                        type="button"
                        onClick={() => adjustQuantity(item.id, -10)}
                        aria-label={`Retirer 10 ${unitLabel} à ${foodItem.name}`}
                        className={stepButtonClass}
                      >
                        --
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustQuantity(item.id, -1)}
                        aria-label={`Retirer 1 ${unitLabel} à ${foodItem.name}`}
                        className={stepButtonClass}
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center text-xs font-semibold text-green-800">
                        {quantity}
                        {unitLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQuantity(item.id, 1)}
                        aria-label={`Ajouter 1 ${unitLabel} à ${foodItem.name}`}
                        className={stepButtonClass}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustQuantity(item.id, 10)}
                        aria-label={`Ajouter 10 ${unitLabel} à ${foodItem.name}`}
                        className={stepButtonClass}
                      >
                        ++
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Retirer ${foodItem.name}`}
                      className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col gap-3 border-t border-green-100 pt-5">
            {items.length > 0 && (
              <div className="mb-2 flex items-center justify-between rounded-xl border border-green-200 px-3 py-2">
                <div className="flex items-center gap-3">
                  {totalMacros.map((m) => (
                    <MacroBadge key={m.label} {...m} />
                  ))}
                </div>
                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-800">
                  {Math.round(rawTotals.kcal)} kcal
                </span>
              </div>
            )}

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
        description={`${editingMeal?.name ?? 'Ce repas'} sera retiré de ta liste.`}
        confirmLabel="Supprimer"
        pendingLabel="Suppression..."
        isPending={isSubmitting}
        onConfirm={() => void handleDelete()}
      />

      <Toast message={successMessage} icon={CheckCircle2} />
    </>
  );
}
