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
    <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase">
        Poids & Objectif
      </h2>
      <div className="mb-4 flex items-end gap-2">
        <span
          className="text-4xl font-bold text-green-800"
          aria-label={`Poids actuel : ${currentWeight} kilogrammes`}
        >
          {currentWeight}
        </span>
        <span className="mb-1 text-green-500" aria-hidden="true">
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
        className="mb-2 h-2 overflow-hidden rounded-full bg-green-100"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression vers l'objectif : ${Math.round(pct)}%`}
      >
        <div
          className="bg-green-1000 h-full rounded-full transition-all"
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
