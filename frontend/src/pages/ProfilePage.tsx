import { useAuth } from '../auth/auth-context';
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard';
import { WeightCard } from '../components/profile/WeightCard';

const STATS = [
  { label: 'Jours suivis', value: '24' },
  { label: 'Repas loggés', value: '87' },
  { label: 'Produits scannés', value: '43' },
];

const HARDCODED_GOALS = [
  { label: 'Objectif calorique', value: '2 000 kcal / jour' },
  { label: 'Protéines', value: '150 g / jour' },
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800">Profil</h2>

      <ProfileIdentityCard user={user} onUpdate={updateUser} />

      <WeightCard userId={user.userId} targetWeight={user.targetWeight} />

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-green-200 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-green-300">{s.value}</p>
            <p className="mt-1 text-xs text-green-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Objectifs */}
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
        <p className="px-5 pt-5 pb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
          Mes objectifs
        </p>
        {HARDCODED_GOALS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-green-200 px-5 py-4"
          >
            <p className="text-sm text-green-600">{item.label}</p>
            <p className="text-sm font-semibold text-green-800">{item.value}</p>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm text-green-600">Poids cible</p>
          <p className="text-sm font-semibold text-green-800">
            {user.targetWeight ? `${user.targetWeight} kg` : '—'}
          </p>
        </div>
      </div>

      {/* Compte */}
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
        <p className="px-5 pt-5 pb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
          Compte
        </p>
        {(
          [
            {
              label: 'Se déconnecter',
              danger: false,
              onClick: () => void logout(),
            },
            { label: 'Exporter mes données', danger: false },
            { label: 'Politique de confidentialité', danger: false },
            { label: 'Supprimer mon compte', danger: true },
          ] satisfies { label: string; danger: boolean; onClick?: () => void }[]
        ).map((item, i, arr) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left text-sm transition-colors ${
              item.danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-green-600 hover:bg-white'
            } ${i < arr.length - 1 ? 'border-b border-green-200' : ''}`}
          >
            {item.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 opacity-40"
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
