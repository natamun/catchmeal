interface Props {
  consumed: number;
  goal: number;
}

export default function CalorieSummary({ consumed, goal }: Props) {
  const pct = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const circumference = 2 * Math.PI * 40;
  const dash = (pct / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
      <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
        Calories du jour
      </h2>
      <div className="flex items-center gap-6">
        <svg
          width="100"
          height="100"
          className="-rotate-90"
          role="img"
          aria-label={`${Math.round(pct)}% de l'objectif calorique atteint`}
        >
          <circle cx="50" cy="50" r="40" fill="none" stroke="#2D6A4F" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#52B788"
            strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div>
          <p className="text-4xl font-bold text-green-800" aria-label={`${consumed} kilocalories consommées`}>{consumed}</p>
          <p className="text-sm text-green-500">kcal consommées</p>
          <p className="mt-2 text-green-300 font-semibold" aria-live="polite">{remaining} kcal restantes</p>
          <p className="text-xs text-green-500">Objectif : {goal} kcal</p>
        </div>
      </div>
    </div>
  );
}
