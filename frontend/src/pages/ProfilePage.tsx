const STATS = [
  { label: 'Jours suivis', value: '24' },
  { label: 'Repas loggés', value: '87' },
  { label: 'Produits scannés', value: '43' },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800">Profil</h2>

      {/* Identité */}
      <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-400 font-bold text-2xl shrink-0">
          M
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-green-800">Maxime</p>
          <p className="text-sm text-green-500">maxime@kcalapp.ch</p>
        </div>
        <button className="text-sm font-medium text-green-300 hover:text-green-400 cursor-pointer transition-colors shrink-0">
          Modifier
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-green-200 shadow-sm text-center"
          >
            <p className="text-2xl font-bold text-green-300">{s.value}</p>
            <p className="text-xs text-green-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Objectifs */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-green-500 uppercase tracking-wide px-5 pt-5 pb-3">
          Mes objectifs
        </p>
        {[
          { label: 'Objectif calorique', value: '2 000 kcal / jour' },
          { label: 'Poids cible', value: '70 kg' },
          { label: 'Protéines', value: '150 g / jour' },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? 'border-b border-green-200' : ''}`}
          >
            <p className="text-sm text-green-600">{item.label}</p>
            <p className="text-sm font-semibold text-green-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Compte */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-green-500 uppercase tracking-wide px-5 pt-5 pb-3">
          Compte
        </p>
        {[
          { label: 'Exporter mes données', danger: false },
          { label: 'Politique de confidentialité', danger: false },
          { label: 'Supprimer mon compte', danger: true },
        ].map((item, i, arr) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between px-5 py-4 text-sm cursor-pointer transition-colors text-left ${
              item.danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-green-600 hover:bg-white'
            } ${i < arr.length - 1 ? 'border-b border-green-200' : ''}`}
          >
            {item.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
