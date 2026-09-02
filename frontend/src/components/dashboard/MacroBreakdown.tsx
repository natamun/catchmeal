interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

function Bar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-green-600">{label}</span>
        <span className="text-green-500">
          {value}g / {goal}g
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-green-100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label={`${label} : ${value}g sur ${goal}g`}
      >
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MacroBreakdown({
  protein,
  carbs,
  fat,
  proteinGoal,
  carbsGoal,
  fatGoal,
}: Macros) {
  return (
    <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase">
        Macronutriments
      </h2>
      <div className="flex flex-col gap-4">
        <Bar
          label="Protéines"
          value={protein}
          goal={proteinGoal}
          color="bg-green-1000"
        />
        <Bar
          label="Glucides"
          value={carbs}
          goal={carbsGoal}
          color="bg-green-300"
        />
        <Bar label="Lipides" value={fat} goal={fatGoal} color="bg-green-300" />
      </div>
    </div>
  );
}
