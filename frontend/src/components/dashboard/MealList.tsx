export interface Meal {
  id: number;
  name: string;
  calories: number;
  time: string;
}

export default function MealList({ meals }: { meals: Meal[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
      <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
        Repas du jour
      </h2>
      {meals.length === 0 ? (
        <p className="text-green-500 text-sm text-center py-4">Aucun repas ajouté</p>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Liste des repas du jour">
          {meals.map((meal) => (
            <li key={meal.id} className="flex items-center justify-between py-2 border-b border-green-200 last:border-0">
              <div>
                <p className="font-medium text-green-800">{meal.name}</p>
                <p className="text-xs text-green-500"><time>{meal.time}</time></p>
              </div>
              <span className="text-green-300 font-semibold" aria-label={`${meal.calories} kilocalories`}>{meal.calories} kcal</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
