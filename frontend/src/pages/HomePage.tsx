import { useRef, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

import CalorieSummary from '../components/home/CalorieSummary';
import DailyMealForm from '../components/home/DailyMealForm';
import DailyMealList from '../components/home/DailyMealList';
import DailyMealPicker from '../components/home/DailyMealPicker';
import DateNavigator from '../components/home/DateNavigator';
import FriendsActivity, {
  type FriendActivity,
} from '../components/home/FriendsActivity';
import MacroBreakdown from '../components/home/MacroBreakdown';
import QuickAddDialog from '../components/home/QuickAddDialog';
import WeightWidget from '../components/home/WeightWidget';
import Header from '../components/layout/Header';
import { buildDrafts, type MealItemDraft } from '../components/meal/draft';
import type { Meal, MealType } from '../components/meal/types';
import { Toast } from '../components/ui/Toast';
import { useDailyMeals } from '../hooks/useDailyMeals';
import { useTimeout } from '../hooks/useTimeout';

const MOCK_FRIENDS: FriendActivity[] = [
  {
    id: 1,
    username: 'alice',
    action: 'a ajouté un repas (540 kcal)',
    time: 'il y a 5 min',
    online: true,
  },
  {
    id: 2,
    username: 'bob',
    action: 'a atteint son objectif du jour 🎉',
    time: 'il y a 23 min',
    online: false,
  },
  {
    id: 3,
    username: 'carol',
    action: 'a enregistré son poids (63 kg)',
    time: 'il y a 1h',
    online: true,
  },
];

const consumed = 1060;

interface SectionEdit {
  mealType: MealType;
  key: number;
  items: MealItemDraft[];
  meals: Meal[];
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [addingMealType, setAddingMealType] = useState<MealType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { meals, foodItems, isLoading, loadError, reload } =
    useDailyMeals(selectedDate);
  const [sectionEdit, setSectionEdit] = useState<SectionEdit>({
    mealType: 'BREAKFAST',
    key: 0,
    items: [],
    meals: [],
  });
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const quickAddDialogRef = useRef<HTMLDialogElement>(null);

  useTimeout(() => setSuccessMessage(null), successMessage ? 3000 : null);

  const openSectionEditor = (mealType: MealType) => {
    const sectionMeals = meals
      .filter((meal) => meal.typeMeal === mealType)
      .sort((a, b) => a.id - b.id);
    setSectionEdit((prev) => ({
      mealType,
      key: prev.key + 1,
      items: buildDrafts([], sectionMeals, foodItems),
      meals: sectionMeals,
    }));
    editDialogRef.current?.showModal();
  };

  return (
    <>
      {addingMealType ? (
        <DailyMealPicker
          mealType={addingMealType}
          date={selectedDate}
          onClose={() => setAddingMealType(null)}
          onAdded={() => {
            setAddingMealType(null);
            setSuccessMessage('Ajouté au journal');
            reload();
          }}
        />
      ) : (
        <div className="animate-fade-in-up">
          <Header username="Maxime" />
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-wrap justify-between gap-3">
              <DateNavigator value={selectedDate} onChange={setSelectedDate} />
              <button
                type="button"
                onClick={() => quickAddDialogRef.current?.showModal()}
                aria-label="Ajout rapide"
                title="Ajout rapide"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-500 px-3 text-sm font-medium text-white transition-colors hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 sm:px-4"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Ajout rapide</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <CalorieSummary consumed={consumed} goal={2000} />
              <MacroBreakdown
                protein={95}
                proteinGoal={150}
                carbs={180}
                carbsGoal={250}
                fat={42}
                fatGoal={65}
              />
              <WeightWidget
                currentWeight={74.2}
                startWeight={80}
                goalWeight={70}
              />
            </div>
            <DailyMealList
              meals={meals}
              foodItems={foodItems}
              isLoading={isLoading}
              loadError={loadError}
              onAdd={setAddingMealType}
              onEdit={openSectionEditor}
            />
            <FriendsActivity activities={MOCK_FRIENDS} />
          </div>
        </div>
      )}
      <DailyMealForm
        dialogRef={editDialogRef}
        mealType={sectionEdit.mealType}
        date={selectedDate}
        initialItems={sectionEdit.items}
        sessionKey={sectionEdit.key}
        existingMeals={sectionEdit.meals}
        onSaved={() => {
          setSuccessMessage('Journal mis à jour');
          reload();
        }}
      />
      <QuickAddDialog
        dialogRef={quickAddDialogRef}
        date={selectedDate}
        onSaved={() => {
          setSuccessMessage('Ajouté au journal');
          reload();
        }}
      />
      <Toast message={successMessage} icon={CheckCircle2} />
    </>
  );
}
