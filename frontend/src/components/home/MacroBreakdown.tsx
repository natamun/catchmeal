import { progressLaps } from './progress';
import SummaryCard from './SummaryCard';

interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  isLoading?: boolean;
}

function Bar({
  label,
  value,
  goal,
  isLoading,
}: {
  label: string;
  value: number;
  goal: number;
  isLoading: boolean;
}) {
  const { lap, extraLap } = progressLaps(isLoading ? 0 : value, goal);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-green-600">{label}</span>
        {isLoading ? (
          <span
            className="h-4 w-20 animate-pulse rounded bg-green-100"
            aria-hidden="true"
          />
        ) : (
          <span className="text-green-500">
            {value}g / {goal}g
          </span>
        )}
      </div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-green-100"
        role="progressbar"
        aria-valuenow={isLoading ? undefined : Math.min(value, goal)}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label={
          isLoading
            ? `${label} : chargement`
            : `${label} : ${value}g sur ${goal}g`
        }
      >
        <div
          className="h-full bg-green-400"
          style={{ width: `${lap * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-green-500"
          style={{ width: `${extraLap * 100}%` }}
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
  isLoading = false,
}: Macros) {
  return (
    <SummaryCard title="Macronutriments" busy={isLoading}>
      <div className="flex flex-1 flex-col justify-between gap-4">
        <Bar
          label="Protéines"
          value={protein}
          goal={proteinGoal}
          isLoading={isLoading}
        />
        <Bar
          label="Glucides"
          value={carbs}
          goal={carbsGoal}
          isLoading={isLoading}
        />
        <Bar label="Lipides" value={fat} goal={fatGoal} isLoading={isLoading} />
      </div>
    </SummaryCard>
  );
}
