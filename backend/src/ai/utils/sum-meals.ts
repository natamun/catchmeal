export interface MealRowAI {
  name: string | null;
  typeMeal: string | null;
  loggedAt: Date | null;
  items: {
    quantity: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    foodItem: { name: string; brand: string | null; baseUnit: string } | null;
  }[];
}

const round = (n: number) => Math.round(n * 10) / 10;

export function sumMeals(meals: MealRowAI[]) {
  const days = new Map<
    string,
    {
      totals: { kcal: number; protein: number; carbs: number; fat: number };
      meals: unknown[];
    }
  >();

  for (const meal of meals) {
    if (!meal.loggedAt) continue;
    const date = meal.loggedAt.toISOString().slice(0, 10);
    const day = days.get(date) ?? {
      totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      meals: [],
    };

    for (const item of meal.items) {
      day.totals.kcal += item.kcal;
      day.totals.protein += item.protein;
      day.totals.carbs += item.carbs;
      day.totals.fat += item.fat;
    }

    day.meals.push({
      type: meal.typeMeal ?? undefined,
      name: meal.name ?? undefined,
      items: meal.items.map((item) => ({
        name: item.foodItem?.name ?? meal.name ?? 'Quick add',
        brand: item.foodItem?.brand ?? undefined,
        quantity: item.foodItem ? item.quantity : undefined,
        unit: item.foodItem?.baseUnit,
        kcal: round(item.kcal),
        protein: round(item.protein),
        carbs: round(item.carbs),
        fat: round(item.fat),
      })),
    });
    days.set(date, day);
  }
  return {
    days: [...days.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        totals: {
          kcal: round(d.totals.kcal),
          protein: round(d.totals.protein),
          carbs: round(d.totals.carbs),
          fat: round(d.totals.fat),
        },
        meals: d.meals,
      })),
  };
}
