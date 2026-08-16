interface Props {
  currentWeight: number;
  startWeight: number;
  goalWeight: number;
}

export default function WeightWidget({
  currentWeight,
  startWeight,
  goalWeight,
}: Props) {
  const total = Math.abs(startWeight - goalWeight);
  const done = Math.abs(startWeight - currentWeight);
  const pct = total > 0 ? Math.min((done / total) * 100, 100) : 0;
  const losing = goalWeight < startWeight;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
      <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
        Poids & Objectif
      </h2>
      <div className="flex items-end gap-2 mb-4">
        <span
          className="text-4xl font-bold text-green-800"
          aria-label={`Poids actuel : ${currentWeight} kilogrammes`}
        >
          {currentWeight}
        </span>
        <span className="text-green-500 mb-1" aria-hidden="true">
          kg
        </span>
        <span
          className={`ml-auto text-sm font-medium ${losing ? 'text-green-400' : 'text-green-300'}`}
        >
          <span aria-hidden="true">{losing ? '▼' : '▲'}</span>
          <span className="sr-only">
            {losing ? 'Perte de' : 'Gain de'}
          </span>{' '}
          {Math.abs(currentWeight - startWeight).toFixed(1)} kg
        </span>
      </div>
      <div
        className="h-2 bg-green-100 rounded-full overflow-hidden mb-2"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression vers l'objectif : ${Math.round(pct)}%`}
      >
        <div
          className="h-full bg-green-1000 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-green-500">
        <span>Départ : {startWeight} kg</span>
        <span>Objectif : {goalWeight} kg</span>
      </div>
    </div>
  );
}
