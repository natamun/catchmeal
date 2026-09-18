import CalorieSummary from '../components/home/CalorieSummary';
import FriendsActivity, {
  type FriendActivity,
} from '../components/home/FriendsActivity';
import MacroBreakdown from '../components/home/MacroBreakdown';
import MealList, { type Meal } from '../components/home/MealList';
import WeightWidget from '../components/home/WeightWidget';
import Header from '../components/layout/Header';

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

export default function HomePage() {
  return (
    <>
      <Header username="Maxime" />
      <div className="flex flex-col gap-4 md:gap-6">
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
          <WeightWidget currentWeight={74.2} startWeight={80} goalWeight={70} />
        </div>
        <MealList meals={MOCK_MEALS} />
        <FriendsActivity activities={MOCK_FRIENDS} />
      </div>
    </>
  );
}
