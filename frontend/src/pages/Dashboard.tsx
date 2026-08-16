import Header from '../components/layout/Header';
import ScannerShortcut from '../components/dashboard/ScannerShortcut';
import CalorieSummary from '../components/dashboard/CalorieSummary';
import MacroBreakdown from '../components/dashboard/MacroBreakdown';
import MealList from '../components/dashboard/MealList';
import WeightWidget from '../components/dashboard/WeightWidget';
import FriendsActivity from '../components/dashboard/FriendsActivity';
import type { Meal } from '../components/dashboard/MealList';
import type { FriendActivity } from '../components/dashboard/FriendsActivity';

const MOCK_MEALS: Meal[] = [
  { id: 1, name: "Flocons d'avoine", calories: 320, time: '08:15' },
  { id: 2, name: 'Poulet grillé + riz', calories: 610, time: '12:30' },
  { id: 3, name: 'Yaourt grec', calories: 130, time: '16:00' },
];

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

const consumed = MOCK_MEALS.reduce((sum, m) => sum + m.calories, 0);

export default function Dashboard() {
  return (
    <>
      <Header username="Maxime" />
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-2">
          <ScannerShortcut />
        </div>
        <CalorieSummary consumed={consumed} goal={2000} />
        <MacroBreakdown
          protein={95}
          proteinGoal={150}
          carbs={180}
          carbsGoal={250}
          fat={42}
          fatGoal={65}
        />
        <MealList meals={MOCK_MEALS} />
        <WeightWidget currentWeight={74.2} startWeight={80} goalWeight={70} />
        <div className="md:col-span-2">
          <FriendsActivity activities={MOCK_FRIENDS} />
        </div>
      </div>
    </>
  );
}
