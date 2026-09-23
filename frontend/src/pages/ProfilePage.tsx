import { useCallback, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { useAuth } from '../auth/auth-context';
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard';
import { DurationDropdown } from '../components/profile/DurationDropdown';
import { WeightCard } from '../components/profile/WeightCard';
import { calculateBMR, calculateTDEE } from '../utils/bmr';

const DURATION_OPTIONS = [
  { label: '2 semaines', days: 14 },
  { label: '1 mois', days: 30 },
  { label: '2 mois', days: 60 },
  { label: '3 mois', days: 90 },
  { label: '4 mois', days: 120 },
  { label: '5 mois', days: 150 },
  { label: '6 mois', days: 180 },
  { label: '1 an', days: 365 },
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [durationDays, setDurationDays] = useState(90);
  const handleLatestWeight = useCallback((w: number) => setLatestWeight(w), []);

  if (!user) return null;

  const bmr =
    latestWeight && user.height && user.birthDate && user.gender
      ? calculateBMR(latestWeight, user.height, user.birthDate, user.gender)
      : null;

  const tdee =
    bmr && user.activityLevel ? calculateTDEE(bmr, user.activityLevel) : null;

  const kcalToReachGoal = (() => {
    if (!tdee || !latestWeight || !user.targetWeight) return null;
    const diff = latestWeight - user.targetWeight;
    const coefficient = diff > 0 ? 7700 : 4800;
    return Math.round(tdee - (diff * coefficient) / durationDays);
  })();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800">Profil</h2>

      <ProfileIdentityCard user={user} onUpdate={updateUser} currentWeight={latestWeight} />

      <WeightCard
        userId={user.userId}
        targetWeight={user.targetWeight}
        onLatestWeight={handleLatestWeight}
      />

      {/* Objectifs */}
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
        <p className="px-5 pt-5 pb-3 text-sm font-semibold tracking-wide text-green-500 uppercase">
          Mes objectifs
        </p>
        <div className="flex items-center justify-between border-b border-green-200 px-5 py-4">
          <p className="text-sm font-semibold text-green-600">Poids cible</p>
          <p className="text-sm font-semibold text-green-800">
            {user.targetWeight ? `${user.targetWeight} kg` : '—'}
          </p>
        </div>
        {kcalToReachGoal ? (
          <div className="flex flex-col border-b border-green-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-green-600">Apport calorique recommandé</p>
              <p className="text-sm font-bold text-green-800">{kcalToReachGoal} kcal / jour</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400 mt-1">
              <span>Pour atteindre {user.targetWeight} kg en</span>
              <DurationDropdown
                value={String(durationDays)}
                options={DURATION_OPTIONS.map((o) => ({ value: String(o.days), label: o.label }))}
                onChange={(v) => setDurationDays(Number(v))}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-green-200 px-5 py-4">
            <p className="text-sm font-semibold text-green-600">Apport calorique recommandé</p>
            <p className="text-sm text-green-400">Données profil incomplètes</p>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-green-200 px-5 py-4">
          <p className="text-sm font-semibold text-green-600">Protéines</p>
          <p className="text-sm font-semibold text-green-800">
            {user.dailyProteinGoal ? `${user.dailyProteinGoal} g / jour` : '—'}
          </p>
        </div>
        <div className="flex items-center justify-between border-b border-green-200 px-5 py-4">
          <p className="text-sm font-semibold text-green-600">Glucides</p>
          <p className="text-sm font-semibold text-green-800">
            {user.dailyCarbsGoal ? `${user.dailyCarbsGoal} g / jour` : '—'}
          </p>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold text-green-600">Lipides</p>
          <p className="text-sm font-semibold text-green-800">
            {user.dailyFatGoal ? `${user.dailyFatGoal} g / jour` : '—'}
          </p>
        </div>
      </div>

      {/* Compte */}
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
        <p className="px-5 pt-5 pb-3 text-sm font-semibold tracking-wide text-green-500 uppercase">
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
                : 'text-green-600 hover:bg-green-50'
            } ${i < arr.length - 1 ? 'border-b border-green-200' : ''}`}
          >
            {item.label}
            <ChevronRight className="h-4 w-4 opacity-40" />
          </button>
        ))}
      </div>
    </div>
  );
}
