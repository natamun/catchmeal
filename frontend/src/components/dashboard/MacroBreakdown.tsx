interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

function Bar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-green-600 font-medium">{label}</span>
        <span className="text-green-500">{value}g / {goal}g</span>
      </div>
      <div
        className="h-2 bg-green-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label={`${label} : ${value}g sur ${goal}g`}
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MacroBreakdown({ protein, carbs, fat, proteinGoal, carbsGoal, fatGoal }: Macros) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
      <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
        Macronutriments
      </h2>
      <div className="flex flex-col gap-4">
        <Bar label="Protéines" value={protein} goal={proteinGoal} color="bg-green-1000" />
        <Bar label="Glucides" value={carbs} goal={carbsGoal} color="bg-green-300" />
        <Bar label="Lipides" value={fat} goal={fatGoal} color="bg-green-300" />
      </div>
    </div>
  );
}
