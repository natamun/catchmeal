import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { useAuth } from '../auth/auth-context';
import CalorieSummary from '../components/home/CalorieSummary';
import DailyMealForm from '../components/home/DailyMealForm';
import DailyMealList from '../components/home/DailyMealList';
import FriendsActivity from '../components/home/FriendsActivity';
import MacroBreakdown from '../components/home/MacroBreakdown';
import QuickAddDialog from '../components/home/QuickAddDialog';
import WeightWidget from '../components/home/WeightWidget';
import { buildDrafts, type MealItemDraft } from '../components/meal/draft';
import { mealTotals, type Meal, type MealType } from '../components/meal/types';
import { getWeightHistory, type WeightEntry } from '../components/profile/api';
import DateNavigator from '../components/ui/DateNavigator';
import { Toast } from '../components/ui/Toast';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useDailyMeals } from '../hooks/useDailyMeals';
import { usePresence } from '../hooks/usePresence';
import { useTimeout } from '../hooks/useTimeout';
import { PATHS } from '../routes';
import {
  journalAddPath,
  journalPath,
  parseDateParam,
} from '../routing/journal';
import type { NavigationState } from '../routing/navigation';
import { latestActivityPerFriend } from '../utils/latestActivityPerFriend';

interface SectionEdit {
  mealType: MealType;
  key: number;
  items: MealItemDraft[];
  meals: Meal[];
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const selectedDate = useMemo(() => parseDateParam(dateParam), [dateParam]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { meals, foodItems, isReady, isLoading, loadError, reload, retry } =
    useDailyMeals(selectedDate);
  const unavailable = !isReady && !isLoading;
  const [weightHistory, setWeightHistory] = useState<WeightEntry[] | null>(
    null,
  );
  const [weightError, setWeightError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    getWeightHistory(user.userId, controller.signal)
      .then(setWeightHistory)
      .catch(() => {
        if (!controller.signal.aborted) setWeightError(true);
      });
    return () => controller.abort();
  }, [user]);

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
  const presence = usePresence(user!.userId);
  const activities = useActivityFeed(user!.userId);
  const latestActivities = latestActivityPerFriend(activities);

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
      <div className="animate-fade-in-up">
        <h1 className="sr-only">Accueil</h1>
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-wrap justify-between gap-3">
            <DateNavigator
              value={selectedDate}
              onChange={(date) =>
                void navigate(journalPath(date), { replace: true })
              }
            />
            <button
              type="button"
              onClick={() => quickAddDialogRef.current?.showModal()}
              aria-label="Ajout rapide"
              title="Ajout rapide"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-500 px-3 text-sm font-medium text-white transition-colors hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 max-2xs:order-first max-2xs:w-full max-2xs:py-2.5 xs:px-4"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden max-2xs:inline xs:inline">
                Ajout rapide
              </span>
            </button>
          </div>
          <div
            key={selectedDate.toDateString()}
            className="flex animate-fade-in-up flex-col gap-4 md:gap-6"
          >
            <div className="grid auto-rows-fr grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
              <CalorieSummary
                consumed={Math.round(dayTotals.kcal)}
                goal={user.dailyCalorieGoal ?? 2000}
                isLoading={isLoading}
                unavailable={unavailable}
              />
              <MacroBreakdown
                protein={Math.round(dayTotals.protein)}
                proteinGoal={user.dailyProteinGoal ?? 150}
                carbs={Math.round(dayTotals.carbs)}
                carbsGoal={user.dailyCarbsGoal ?? 250}
                fat={Math.round(dayTotals.fat)}
                fatGoal={user.dailyFatGoal ?? 65}
                isLoading={isLoading}
                unavailable={unavailable}
              />
              <WeightWidget
                history={weightHistory}
                hasError={weightError}
                goalWeight={user.targetWeight ?? null}
              />
            </div>
            <DailyMealList
              meals={meals}
              foodItems={foodItems}
              isLoading={isLoading}
              loadError={loadError}
              onRetry={retry}
              onAdd={(mealType) =>
                void navigate(journalAddPath(mealType, selectedDate))
              }
              onEdit={openSectionEditor}
            />
          </div>
          <FriendsActivity
            activities={latestActivities}
            presence={presence}
            onReply={(activity) =>
              void navigate(PATHS.friends, {
                state: { replyTo: activity } satisfies NavigationState,
              })
            }
          />
        </div>
      </div>
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
