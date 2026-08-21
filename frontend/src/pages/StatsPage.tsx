const PERIODS = ['7 jours', '30 jours', '3 mois'];

const WEEKLY = [
  { day: 'Lun', kcal: 1850 },
  { day: 'Mar', kcal: 2100 },
  { day: 'Mer', kcal: 1760 },
  { day: 'Jeu', kcal: 2000 },
  { day: 'Ven', kcal: 2240 },
  { day: 'Sam', kcal: 1600 },
  { day: 'Dim', kcal: 1920 },
];

const MAX = Math.max(...WEEKLY.map((d) => d.kcal));

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-800">Statistiques</h2>
        <div className="flex gap-1 bg-green-100 rounded-xl p-1">
          {PERIODS.map((p, i) => (
            <button
              key={p}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                i === 0
                  ? 'bg-white text-green-800 shadow-sm'
                  : 'text-green-500 hover:text-green-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart calories */}
      <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
        <p className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-6">
          Calories / jour
        </p>
        <div className="flex items-end gap-2 h-36">
          {WEEKLY.map((d) => {
            const pct = (d.kcal / MAX) * 100;
            return (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-green-500">{d.kcal}</span>
                <div
                  className="w-full flex items-end bg-green-100 rounded-lg overflow-hidden"
                  style={{ height: '80px' }}
                >
                  <div
                    className="w-full bg-green-400 rounded-lg transition-all"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-green-500">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macros moyenne */}
      <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
        <p className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
          Moyenne des macros
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Protéines', value: '112g', color: 'text-green-300' },
            { label: 'Glucides', value: '198g', color: 'text-green-300' },
            { label: 'Lipides', value: '58g', color: 'text-green-300' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-4">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-green-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Poids */}
      <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
        <p className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
          Évolution du poids
        </p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-green-800">
              74.2{' '}
              <span className="text-base font-normal text-green-500">kg</span>
            </p>
            <p className="text-sm text-green-300 font-medium mt-1">
              ▼ 5.8 kg depuis le début
            </p>
          </div>
          <div className="flex-1 h-px bg-green-100" />
          <div className="text-right">
            <p className="text-sm text-green-500">Objectif</p>
            <p className="text-lg font-bold text-green-800">70 kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
