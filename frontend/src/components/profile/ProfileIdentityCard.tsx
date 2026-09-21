import { useEffect, useRef, useState } from 'react';

import type { AuthUser } from '../../auth/auth-context';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { updateProfile, uploadAvatar, type UserProfile } from './api';

interface Props {
  user: AuthUser;
  onUpdate: (partial: Partial<AuthUser>) => void;
}

export function ProfileIdentityCard({ user, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState(user.username);
  const [draftName, setDraftName] = useState(user.name ?? '');
  const [draftHeight, setDraftHeight] = useState(user.height?.toString() ?? '');
  const [draftTargetWeight, setDraftTargetWeight] = useState(
    user.targetWeight?.toString() ?? '',
  );
  const [draftDailyCalorieGoal, setDraftDailyCalorieGoal] = useState(
    user.dailyCalorieGoal?.toString() ?? '',
  );
  const [draftDailyProteinGoal, setDraftDailyProteinGoal] = useState(
    user.dailyProteinGoal?.toString() ?? '',
  );
  const [draftGender, setDraftGender] = useState(user.gender ?? '');
  const [draftBirthDate, setDraftBirthDate] = useState(
    user.birthDate ? user.birthDate.slice(0, 10) : '',
  );
  const [draftActivityLevel, setDraftActivityLevel] = useState(
    user.activityLevel ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setTimeout(() => usernameRef.current?.focus(), 0);
    }
  }, [editing]);

  function handleEdit() {
    setDraftUsername(user.username);
    setDraftName(user.name ?? '');
    setDraftHeight(user.height?.toString() ?? '');
    setDraftTargetWeight(user.targetWeight?.toString() ?? '');
    setDraftDailyCalorieGoal(user.dailyCalorieGoal?.toString() ?? '');
    setDraftDailyProteinGoal(user.dailyProteinGoal?.toString() ?? '');
    setDraftGender(user.gender ?? '');
    setDraftBirthDate(user.birthDate ? user.birthDate.slice(0, 10) : '');
    setDraftActivityLevel(user.activityLevel ?? '');
    setSaveError(null);
    setEditing(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const updated = await uploadAvatar(user.userId, file);
      onUpdate({ avatarUrl: updated.avatarUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave() {
    const trimmedUsername = draftUsername.trim();
    const trimmedName = draftName.trim();

    if (
      trimmedUsername === user.username &&
      trimmedName === (user.name ?? '') &&
      draftHeight === (user.height?.toString() ?? '') &&
      draftTargetWeight === (user.targetWeight?.toString() ?? '') &&
      draftDailyCalorieGoal === (user.dailyCalorieGoal?.toString() ?? '') &&
      draftDailyProteinGoal === (user.dailyProteinGoal?.toString() ?? '') &&
      draftGender === (user.gender ?? '') &&
      draftBirthDate === (user.birthDate ? user.birthDate.slice(0, 10) : '') &&
      draftActivityLevel === (user.activityLevel ?? '')
    ) {
      setEditing(false);
      return;
    }

    const input: {
      username?: string;
      name?: string;
      height?: number;
      targetWeight?: number;
      dailyCalorieGoal?: number;
      dailyProteinGoal?: number;
      gender?: string;
      birthDate?: string;
      activityLevel?: string;
    } = {};
    if (trimmedUsername !== user.username) input.username = trimmedUsername;
    if (trimmedName !== (user.name ?? '')) input.name = trimmedName;
    const parsedHeight = draftHeight ? parseFloat(draftHeight) : undefined;
    if (
      parsedHeight !== undefined &&
      (parsedHeight <= 0 || parsedHeight > 300)
    ) {
      setSaveError('La taille doit être entre 1 et 300 cm');
      return;
    }
    if (parsedHeight !== (user.height ?? undefined))
      input.height = parsedHeight;
    const parsedTargetWeight = draftTargetWeight
      ? parseFloat(draftTargetWeight)
      : undefined;
    if (parsedTargetWeight !== (user.targetWeight ?? undefined))
      input.targetWeight = parsedTargetWeight;
    const parsedDailyCalorieGoal = draftDailyCalorieGoal
      ? parseInt(draftDailyCalorieGoal)
      : undefined;
    if (parsedDailyCalorieGoal !== (user.dailyCalorieGoal ?? undefined))
      input.dailyCalorieGoal = parsedDailyCalorieGoal;
    const parsedDailyProteinGoal = draftDailyProteinGoal
      ? parseInt(draftDailyProteinGoal)
      : undefined;
    if (parsedDailyProteinGoal !== (user.dailyProteinGoal ?? undefined))
      input.dailyProteinGoal = parsedDailyProteinGoal;
    if (draftGender !== (user.gender ?? ''))
      input.gender = draftGender || undefined;
    if (draftBirthDate !== (user.birthDate ? user.birthDate.slice(0, 10) : ''))
      input.birthDate = draftBirthDate || undefined;
    if (draftActivityLevel !== (user.activityLevel ?? ''))
      input.activityLevel = draftActivityLevel || undefined;

    setSaving(true);
    setSaveError(null);
    try {
      const updated: UserProfile = await updateProfile(user.userId, input);
      onUpdate({
        username: updated.username,
        name: updated.name,
        height: updated.height ?? undefined,
        targetWeight: updated.targetWeight ?? undefined,
        dailyCalorieGoal: updated.dailyCalorieGoal ?? undefined,
        dailyProteinGoal: updated.dailyProteinGoal ?? undefined,
        gender: updated.gender ?? undefined,
        birthDate: updated.birthDate ?? undefined,
        activityLevel: updated.activityLevel ?? undefined,
      });
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setSaveError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleSave();
    if (e.key === 'Escape') handleCancel();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <Avatar
            username={user.username}
            avatarUrl={user.avatarUrl}
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            editable
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />

          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-green-800">{user.username}</p>
            {user.name && <p className="text-sm text-green-500">{user.name}</p>}
            {uploading && <p className="text-sm text-green-400">Upload en cours...</p>}
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>

          <div className="shrink-0">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => void handleSave()}
                  disabled={saving || draftUsername.trim().length < 3}
                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? '...' : 'Sauver'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-500 transition-colors hover:bg-green-50"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="cursor-pointer text-sm font-medium text-green-400 transition-colors hover:text-green-500"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <p className="px-5 pt-5 pb-3 text-sm font-semibold tracking-wide text-green-500 uppercase">
            Modifier le profil
          </p>
          <div className="grid grid-cols-2 gap-4 px-5 pb-5">
            <div className="col-span-2">
              <label htmlFor="draft-username" className="mb-1 block text-sm font-semibold text-green-600">Nom d'utilisateur</label>
              <Input id="draft-username" ref={usernameRef} value={draftUsername} onChange={(e) => setDraftUsername(e.target.value)} onKeyDown={handleKeyDown} minLength={3} maxLength={30} />
            </div>
            <div className="col-span-2">
              <label htmlFor="draft-name" className="mb-1 block text-sm font-semibold text-green-600">Nom complet</label>
              <Input id="draft-name" value={draftName} onChange={(e) => setDraftName(e.target.value)} onKeyDown={handleKeyDown} maxLength={80} />
            </div>
            <div>
              <label htmlFor="draft-gender" className="mb-1 block text-sm font-semibold text-green-600">Genre</label>
              <select id="draft-gender" value={draftGender} onChange={(e) => setDraftGender(e.target.value)} className="w-full rounded-lg border border-green-200 px-3 py-2 text-sm text-green-800 focus:ring-2 focus:ring-green-300 focus:outline-none">
                <option value="">—</option>
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="draft-birth-date" className="mb-1 block text-sm font-semibold text-green-600">Date de naissance</label>
              <Input id="draft-birth-date" type="date" value={draftBirthDate} onChange={(e) => setDraftBirthDate(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <div className="col-span-2">
              <label htmlFor="draft-activity-level" className="mb-1 block text-sm font-semibold text-green-600">Niveau d'activité</label>
              <select id="draft-activity-level" value={draftActivityLevel} onChange={(e) => setDraftActivityLevel(e.target.value)} className="w-full rounded-lg border border-green-200 px-3 py-2 text-sm text-green-800 focus:ring-2 focus:ring-green-300 focus:outline-none">
                <option value="">—</option>
                <option value="SEDENTARY">Sédentaire</option>
                <option value="LIGHTLY_ACTIVE">Légèrement actif</option>
                <option value="MODERATELY_ACTIVE">Modérément actif</option>
                <option value="VERY_ACTIVE">Très actif</option>
                <option value="EXTRA_ACTIVE">Extrêmement actif</option>
              </select>
            </div>
            <div>
              <label htmlFor="draft-height" className="mb-1 block text-sm font-semibold text-green-600">Taille (cm)</label>
              <Input id="draft-height" type="number" min={50} max={300} value={draftHeight} onChange={(e) => setDraftHeight(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <div>
              <label htmlFor="draft-target-weight" className="mb-1 block text-sm font-semibold text-green-600">Poids cible (kg)</label>
              <Input id="draft-target-weight" type="number" min={20} max={500} step={0.1} value={draftTargetWeight} onChange={(e) => setDraftTargetWeight(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <div>
              <label htmlFor="draft-daily-calorie-goal" className="mb-1 block text-sm font-semibold text-green-600">Objectif calorique (kcal/jour)</label>
              <Input id="draft-daily-calorie-goal" type="number" min={500} max={10000} value={draftDailyCalorieGoal} onChange={(e) => setDraftDailyCalorieGoal(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <div>
              <label htmlFor="draft-daily-protein-goal" className="mb-1 block text-sm font-semibold text-green-600">Objectif protéines (g/jour)</label>
              <Input id="draft-daily-protein-goal" type="number" min={10} max={500} value={draftDailyProteinGoal} onChange={(e) => setDraftDailyProteinGoal(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            {saveError && <div className="col-span-2"><p className="text-xs text-red-500">{saveError}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
