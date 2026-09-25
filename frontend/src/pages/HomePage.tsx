import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

import { useAuth } from '../auth/auth-context';
import CalorieSummary from '../components/home/CalorieSummary';
import DailyMealForm from '../components/home/DailyMealForm';
import DailyMealList from '../components/home/DailyMealList';
import DailyMealPicker from '../components/home/DailyMealPicker';
import DateNavigator from '../components/home/DateNavigator';
import FriendsActivity from '../components/home/FriendsActivity';
import MacroBreakdown from '../components/home/MacroBreakdown';
import QuickAddDialog from '../components/home/QuickAddDialog';
import WeightWidget from '../components/home/WeightWidget';
import Header from '../components/layout/Header';
import { buildDrafts, type MealItemDraft } from '../components/meal/draft';
import { mealTotals, type Meal, type MealType } from '../components/meal/types';
import { getWeightHistory } from '../components/profile/api';
import { Toast } from '../components/ui/Toast';
import { useDailyMeals } from '../hooks/useDailyMeals';
import { useFriends } from '../hooks/useFriends';
import { useTimeout } from '../hooks/useTimeout';

interface SectionEdit {
  mealType: MealType;
  key: number;
  items: MealItemDraft[];
  meals: Meal[];
}

interface HomePageProps {
  onNavigateToProfile?: () => void;
}

export default function HomePage({ onNavigateToProfile }: HomePageProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [addingMealType, setAddingMealType] = useState<MealType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { meals, foodItems, isLoading, loadError, reload } =
    useDailyMeals(selectedDate);

  const {
    friends,
    isLoading: friendsLoading,
    loadError: friendsError,
  } = useFriends(user!.userId);

  const [weightHistory, setWeightHistory] = useState<{ weight: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    getWeightHistory(user.userId, controller.signal)
      .then(setWeightHistory)
      .catch(() => {});
    return () => controller.abort();
  }, [user]);

  const latestWeight = weightHistory[0]?.weight ?? null;
  const firstWeight = weightHistory.at(-1)?.weight ?? null;

  const dayTotals = meals.reduce(
    (acc, meal) => {
      const t = mealTotals(meal);
      return {
        kcal: acc.kcal + t.kcal,
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fat: acc.fat + t.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const [sectionEdit, setSectionEdit] = useState<SectionEdit>({
    mealType: 'BREAKFAST',
    key: 0,
    items: [],
    meals: [],
  });
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const quickAddDialogRef = useRef<HTMLDialogElement>(null);

  useTimeout(() => setSuccessMessage(null), successMessage ? 3000 : null);

  if (!user) return null;

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
          <Header
            username={user.username}
            avatarUrl={user.avatarUrl ?? undefined}
            onNavigateToProfile={onNavigateToProfile}
          />
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
              <CalorieSummary
                consumed={Math.round(dayTotals.kcal)}
                goal={user.dailyCalorieGoal ?? 2000}
              />
              <MacroBreakdown
                protein={Math.round(dayTotals.protein)}
                proteinGoal={user.dailyProteinGoal ?? 150}
                carbs={Math.round(dayTotals.carbs)}
                carbsGoal={user.dailyCarbsGoal ?? 250}
                fat={Math.round(dayTotals.fat)}
                fatGoal={user.dailyFatGoal ?? 65}
              />
              {latestWeight !== null && firstWeight !== null && (
                <WeightWidget
                  currentWeight={latestWeight}
                  startWeight={firstWeight}
                  goalWeight={user.targetWeight ?? latestWeight}
                />
              )}
            </div>
            <DailyMealList
              meals={meals}
              foodItems={foodItems}
              isLoading={isLoading}
              loadError={loadError}
              onAdd={setAddingMealType}
              onEdit={openSectionEditor}
            />
            <FriendsActivity
              activities={friends.map((f) => ({
                id: f.friendshipId,
                username: f.friend.username,
                action: '',
                time: '',
                online: false,
              }))}
              isLoading={friendsLoading}
              loadError={friendsError}
            />
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
