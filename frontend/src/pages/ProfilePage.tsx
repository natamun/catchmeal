import { useCallback, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { useAuth } from '../auth/auth-context';
import { DurationDropdown } from '../components/profile/DurationDropdown';
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard';
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

interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  createAt: string;
  meal: unknown[];
  weightLogs: unknown[];
  goalSettings: unknown[];
  senderMessage: unknown[];
  receiverMessage: unknown[];
}

interface ExportResponse {
  exportedAt: string;
  data: {
    profile: UserProfile;
  };
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [durationDays, setDurationDays] = useState(90);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  async function handleExport() {
    setExportLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/gdpr/export/${user!.userId}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = (await response.json()) as ExportResponse;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-data.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'export de vos données");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/gdpr/account/${user!.userId}`,
        { method: 'DELETE', credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to delete account');
      void logout();
    } catch {
      alert('Erreur lors de la suppression du compte');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800">Profil</h2>

      <ProfileIdentityCard
        user={user}
        onUpdate={updateUser}
        currentWeight={latestWeight}
      />

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
              <p className="text-sm font-semibold text-green-600">
                Apport calorique recommandé
              </p>
              <p className="text-sm font-bold text-green-800">
                {kcalToReachGoal} kcal / jour
              </p>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-green-400">
              <span>Pour atteindre {user.targetWeight} kg en</span>
              <DurationDropdown
                value={String(durationDays)}
                options={DURATION_OPTIONS.map((o) => ({
                  value: String(o.days),
                  label: o.label,
                }))}
                onChange={(v) => setDurationDays(Number(v))}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-green-200 px-5 py-4">
            <p className="text-sm font-semibold text-green-600">
              Apport calorique recommandé
            </p>
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
            {
              label: exportLoading ? 'Export en cours...' : 'Exporter mes données',
              danger: false,
              onClick: () => void handleExport(),
              disabled: exportLoading,
            },
            { label: 'Politique de confidentialité', danger: false },
            {
              label: 'Supprimer mon compte',
              danger: true,
              onClick: () => setShowDeleteConfirm(true),
            },
          ] satisfies {
            label: string;
            danger: boolean;
            onClick?: () => void;
            disabled?: boolean;
          }[]
        ).map((item, i, arr) => (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left text-sm transition-colors ${
              item.danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            } ${i < arr.length - 1 ? 'border-b border-green-200' : ''} ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {item.label}
            <ChevronRight className="h-4 w-4 opacity-40" />
          </button>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-red-600">
              Supprimer mon compte
            </h3>
            <p className="mt-2 text-sm text-green-600">
              Cette action est irréversible. Toutes vos données seront
              anonymisées et vous ne pourrez plus vous reconnecter.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-600 transition-colors hover:bg-green-200"
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={() => void handleDeleteAccount()}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
