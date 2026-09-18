export interface Meal {
  id: number;
  name: string;
  calories: number;
  time: string;
}

export default function MealList({ meals }: { meals: Meal[] }) {
  return (
    <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase">
        Repas du jour
      </h2>
      {meals.length === 0 ? (
        <p className="py-4 text-center text-sm text-green-500">
          Aucun repas ajouté
        </p>
      ) : (
        <ul
          className="flex flex-col gap-3"
          aria-label="Liste des repas du jour"
        >
          {meals.map((meal) => (
            <li
              key={meal.id}
              className="flex items-center justify-between border-b border-green-200 py-2 last:border-0"
            >
              <div>
                <p className="font-medium text-green-800">{meal.name}</p>
                <p className="text-xs text-green-500">
                  <time>{meal.time}</time>
                </p>
              </div>
              <span
                className="font-semibold text-green-300"
                aria-label={`${meal.calories} kilocalories`}
              >
                {meal.calories} kcal
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
