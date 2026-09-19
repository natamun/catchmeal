import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import CalorieSummary from '../components/home/CalorieSummary';
import DailyMealList from '../components/home/DailyMealList';
import DailyMealPicker from '../components/home/DailyMealPicker';
import DateNavigator from '../components/home/DateNavigator';
import FriendsActivity, {
  type FriendActivity,
} from '../components/home/FriendsActivity';
import MacroBreakdown from '../components/home/MacroBreakdown';
import WeightWidget from '../components/home/WeightWidget';
import Header from '../components/layout/Header';
import type { MealType } from '../components/meal/types';
import { Toast } from '../components/ui/Toast';
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

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [addingMealType, setAddingMealType] = useState<MealType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useTimeout(() => setSuccessMessage(null), successMessage ? 3000 : null);

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
          }}
        />
      ) : (
        <div className="animate-fade-in-up">
          <Header username="Maxime" />
          <div className="flex flex-col gap-4 md:gap-6">
            <DateNavigator value={selectedDate} onChange={setSelectedDate} />
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
            <DailyMealList onAdd={setAddingMealType} />
            <FriendsActivity activities={MOCK_FRIENDS} />
          </div>
        </div>
      )}
      <Toast message={successMessage} icon={CheckCircle2} />
    </>
  );
}
