import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

import type { AuthUser } from '../../auth/auth-context';
import { useTimeout } from '../../hooks/useTimeout';
import { Avatar } from '../ui/Avatar';
import { BaseDialog } from '../ui/BaseDialog';
import { EditIconButton } from '../ui/EditIconButton';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';
import { SelectDropdown } from '../ui/SelectDropdown';
import {
  removeAvatar,
  updateProfile,
  uploadAvatar,
  type UserProfile,
} from './api';
import { BirthDatePicker } from './BirthDatePicker';
import { BmiBadge } from './BmiBadge';
import { WeightProgressBadge } from './WeightProgressBadge';

interface Props {
  user: AuthUser;
  onUpdate: (partial: Partial<AuthUser>) => void;
  currentWeight?: number | null;
}

type Field =
  | 'username'
  | 'height'
  | 'targetWeight'
  | 'dailyCalorieGoal'
  | 'dailyProteinGoal'
  | 'dailyCarbsGoal'
  | 'dailyFatGoal';

interface FormState {
  username: string;
  name: string;
  height: string;
  targetWeight: string;
  dailyCalorieGoal: string;
  dailyProteinGoal: string;
  dailyCarbsGoal: string;
  dailyFatGoal: string;
  gender: string;
  birthDate: string;
  activityLevel: string;
}

function validate(form: FormState): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (form.username.trim().length < 3) errors.username = 'Minimum 3 caractères';
  else if (form.username.trim().length > 30)
    errors.username = 'Maximum 30 caractères';
  if (form.height) {
    const h = parseFloat(form.height);
    if (isNaN(h)) errors.height = 'Valeur invalide';
    else if (h < 50 || h > 300) errors.height = 'Entre 50 et 300 cm';
  }
  if (form.targetWeight) {
    const w = parseFloat(form.targetWeight);
    if (isNaN(w)) errors.targetWeight = 'Valeur invalide';
    else if (w < 20 || w > 500) errors.targetWeight = 'Entre 20 et 500 kg';
  }
  if (form.dailyCalorieGoal) {
    const c = parseInt(form.dailyCalorieGoal);
    if (isNaN(c)) errors.dailyCalorieGoal = 'Valeur invalide';
    else if (c < 500 || c > 10000)
      errors.dailyCalorieGoal = 'Entre 500 et 10000 kcal';
  }
  if (form.dailyProteinGoal) {
    const p = parseInt(form.dailyProteinGoal);
    if (isNaN(p)) errors.dailyProteinGoal = 'Valeur invalide';
    else if (p < 10 || p > 500) errors.dailyProteinGoal = 'Entre 10 et 500 g';
  }
  if (form.dailyCarbsGoal) {
    const c = parseInt(form.dailyCarbsGoal);
    if (isNaN(c)) errors.dailyCarbsGoal = 'Valeur invalide';
    else if (c < 10 || c > 2000) errors.dailyCarbsGoal = 'Entre 10 et 2000 g';
  }
  if (form.dailyFatGoal) {
    const f = parseInt(form.dailyFatGoal);
    if (isNaN(f)) errors.dailyFatGoal = 'Valeur invalide';
    else if (f < 10 || f > 1000) errors.dailyFatGoal = 'Entre 10 et 1000 g';
  }
  return errors;
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Homme' },
  { value: 'FEMALE', label: 'Femme' },
  { value: 'OTHER', label: 'Autre' },
];

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sédentaire' },
  { value: 'LIGHTLY_ACTIVE', label: 'Légèrement actif' },
  { value: 'MODERATELY_ACTIVE', label: 'Modérément actif' },
  { value: 'VERY_ACTIVE', label: 'Très actif' },
  { value: 'EXTRA_ACTIVE', label: 'Extrêmement actif' },
];

export function ProfileIdentityCard({ user, onUpdate, currentWeight }: Props) {
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);

  const initForm = (): FormState => ({
    username: user.username,
    name: user.name ?? '',
    height: user.height?.toString() ?? '',
    targetWeight: user.targetWeight?.toString() ?? '',
    dailyCalorieGoal: user.dailyCalorieGoal?.toString() ?? '',
    dailyProteinGoal: user.dailyProteinGoal?.toString() ?? '',
    dailyCarbsGoal: user.dailyCarbsGoal?.toString() ?? '',
    dailyFatGoal: user.dailyFatGoal?.toString() ?? '',
    gender: user.gender ?? '',
    birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
    activityLevel: user.activityLevel ?? '',
  });

  const [form, setForm] = useState<FormState>(initForm);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [focusedField, setFocusedField] = useState<Field | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);

  const errors = validate(form);

  const handleChange = (field: Field, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: Field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((cur) => (cur === field ? null : cur));
  };

  const isInvalid = (field: Field) => Boolean(touched[field] && errors[field]);

  const errorMessage = (field: Field) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  function handleEdit() {
    setForm(initForm());
    setTouched({});
    setFocusedField(null);
    setSubmitAttempted(false);
    setSaveError(null);
    setAvatarError(null);
    setDialogNode(dialogRef.current);
    dialogRef.current?.showModal();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const updated = await uploadAvatar(user.userId, file);
      onUpdate({ avatarUrl: updated.avatarUrl });
    } catch {
      setAvatarError("Impossible d'envoyer la photo. Réessayez.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await removeAvatar(user.userId);
      onUpdate({ avatarUrl: null });
    } catch {
      setAvatarError('Impossible de supprimer la photo. Réessayez.');
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleSave() {
    const allTouched = Object.fromEntries(
      (
        [
          'username',
          'height',
          'targetWeight',
          'dailyCalorieGoal',
          'dailyProteinGoal',
          'dailyCarbsGoal',
          'dailyFatGoal',
        ] as Field[]
      ).map((f) => [f, true]),
    );
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    const input: {
      username?: string;
      name?: string;
      height?: number;
      targetWeight?: number;
      dailyCalorieGoal?: number;
      dailyProteinGoal?: number;
      dailyCarbsGoal?: number;
      dailyFatGoal?: number;
      gender?: string;
      birthDate?: string;
      activityLevel?: string;
    } = {};

    const trimmedUsername = form.username.trim();
    const trimmedName = form.name.trim();
    if (trimmedUsername !== user.username) input.username = trimmedUsername;
    if (trimmedName !== (user.name ?? '')) input.name = trimmedName;
    const parsedHeight = form.height ? parseFloat(form.height) : undefined;
    if (parsedHeight !== (user.height ?? undefined))
      input.height = parsedHeight;
    const parsedTargetWeight = form.targetWeight
      ? parseFloat(form.targetWeight)
      : undefined;
    if (parsedTargetWeight !== (user.targetWeight ?? undefined))
      input.targetWeight = parsedTargetWeight;
    const parsedDailyCalorieGoal = form.dailyCalorieGoal
      ? parseInt(form.dailyCalorieGoal)
      : undefined;
    if (parsedDailyCalorieGoal !== (user.dailyCalorieGoal ?? undefined))
      input.dailyCalorieGoal = parsedDailyCalorieGoal;
    const parsedDailyProteinGoal = form.dailyProteinGoal
      ? parseInt(form.dailyProteinGoal)
      : undefined;
    if (parsedDailyProteinGoal !== (user.dailyProteinGoal ?? undefined))
      input.dailyProteinGoal = parsedDailyProteinGoal;
    const parsedDailyCarbsGoal = form.dailyCarbsGoal
      ? parseInt(form.dailyCarbsGoal)
      : undefined;
    if (parsedDailyCarbsGoal !== (user.dailyCarbsGoal ?? undefined))
      input.dailyCarbsGoal = parsedDailyCarbsGoal;
    const parsedDailyFatGoal = form.dailyFatGoal
      ? parseInt(form.dailyFatGoal)
      : undefined;
    if (parsedDailyFatGoal !== (user.dailyFatGoal ?? undefined))
      input.dailyFatGoal = parsedDailyFatGoal;
    if (form.gender !== (user.gender ?? ''))
      input.gender = form.gender || undefined;
    if (form.birthDate !== (user.birthDate ? user.birthDate.slice(0, 10) : ''))
      input.birthDate = form.birthDate || undefined;
    if (form.activityLevel !== (user.activityLevel ?? ''))
      input.activityLevel = form.activityLevel || undefined;

    if (Object.keys(input).length === 0) {
      dialogRef.current?.close();
      return;
    }

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
        dailyCarbsGoal: updated.dailyCarbsGoal ?? undefined,
        dailyFatGoal: updated.dailyFatGoal ?? undefined,
        gender: updated.gender ?? undefined,
        birthDate: updated.birthDate ?? undefined,
        activityLevel: updated.activityLevel ?? undefined,
      });
      dialogRef.current?.close();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar
            username={user.username}
            avatarUrl={user.avatarUrl}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-base font-bold text-green-800">
              {user.username}
            </p>
            {user.name && <p className="text-xs text-green-500">{user.name}</p>}
          </div>
          {((currentWeight && user.height) ||
            (currentWeight && user.targetWeight)) && (
            <div className="flex flex-1 items-center justify-center gap-2">
              {currentWeight && user.height && (
                <BmiBadge weight={currentWeight} height={user.height} />
              )}
              {currentWeight && user.targetWeight && (
                <WeightProgressBadge
                  current={currentWeight}
                  target={user.targetWeight}
                />
              )}
            </div>
          )}
          <div className="ml-auto">
            <EditIconButton label="Modifier le profil" onClick={handleEdit} />
          </div>
        </div>
      </div>

      <BaseDialog
        dialogRef={dialogRef}
        title="Modifier le profil"
        onClose={() => setSaveError(null)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center gap-3">
            <Avatar username={user.username} avatarUrl={user.avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-600">
                Photo de profil
              </p>
              {avatarError ? (
                <p role="alert" className="text-xs text-red-500">
                  {avatarError}
                </p>
              ) : (
                avatarBusy && (
                  <p className="text-xs text-green-500">Envoi en cours...</p>
                )
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              className="cursor-pointer rounded-xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {user.avatarUrl ? 'Changer' : 'Ajouter'}
            </button>
            {user.avatarUrl && (
              <button
                type="button"
                onClick={() => void handleAvatarRemove()}
                disabled={avatarBusy}
                aria-label="Supprimer la photo"
                className="cursor-pointer text-green-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="relative col-span-2 flex flex-col gap-1">
            <label
              htmlFor="pf-username"
              className="text-sm font-semibold text-green-600"
            >
              Nom d'utilisateur
            </label>
            <Input
              id="pf-username"
              placeholder="Ex : jdupont"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => handleBlur('username')}
              aria-invalid={isInvalid('username')}
            />
            <FieldError
              id="pf-username-error"
              message={errorMessage('username')}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label
              htmlFor="pf-name"
              className="text-sm font-semibold text-green-600"
            >
              Nom complet
            </label>
            <Input
              id="pf-name"
              placeholder="Nom Prénom"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              maxLength={80}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="pf-gender"
              className="text-sm font-semibold text-green-600"
            >
              Genre
            </label>
            <SelectDropdown
              id="pf-gender"
              value={form.gender}
              options={GENDER_OPTIONS}
              onChange={(v) => setForm((p) => ({ ...p, gender: v }))}
              container={dialogNode}
              placeholder="Sélectionner"
            />
          </div>

          <BirthDatePicker
            id="pf-birthdate"
            label="Date de naissance"
            value={form.birthDate}
            onChange={(birthDate) => setForm((p) => ({ ...p, birthDate }))}
          />

          <div className="col-span-2 flex flex-col gap-1">
            <label
              htmlFor="pf-activity"
              className="text-sm font-semibold text-green-600"
            >
              Niveau d'activité
            </label>
            <SelectDropdown
              id="pf-activity"
              value={form.activityLevel}
              options={ACTIVITY_OPTIONS}
              onChange={(v) => setForm((p) => ({ ...p, activityLevel: v }))}
              container={dialogNode}
              placeholder="Sélectionner"
            />
          </div>

          <p className="col-span-2 pt-2 text-xs font-semibold tracking-wide text-green-400 uppercase">
            Objectifs
          </p>

          {[
            {
              field: 'height' as Field,
              id: 'pf-height',
              label: 'Taille',
              unit: 'cm',
              example: '175',
            },
            {
              field: 'targetWeight' as Field,
              id: 'pf-target-weight',
              label: 'Poids cible',
              unit: 'kg',
              example: '70',
            },
            {
              field: 'dailyCalorieGoal' as Field,
              id: 'pf-calorie-goal',
              label: 'Objectif calorique',
              unit: 'kcal/jour',
              example: '2000',
            },
            {
              field: 'dailyProteinGoal' as Field,
              id: 'pf-protein-goal',
              label: 'Objectif protéines',
              unit: 'g/jour',
              example: '120',
            },
            {
              field: 'dailyCarbsGoal' as Field,
              id: 'pf-carbs-goal',
              label: 'Objectif glucides',
              unit: 'g/jour',
              example: '230',
            },
            {
              field: 'dailyFatGoal' as Field,
              id: 'pf-fat-goal',
              label: 'Objectif lipides',
              unit: 'g/jour',
              example: '65',
            },
          ].map(({ field, id, label, unit, example }) => (
            <div
              key={field}
              className="relative flex flex-col justify-end gap-1"
            >
              <label
                htmlFor={id}
                className="text-sm font-semibold text-green-600"
              >
                {label}{' '}
                <span
                  className={unit.endsWith('/jour') ? 'max-[500px]:block' : ''}
                >
                  ({unit})
                </span>
              </label>
              <Input
                id={id}
                type="text"
                inputMode="decimal"
                placeholder={`Ex : ${example}`}
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => handleBlur(field)}
                aria-invalid={isInvalid(field)}
              />
              <FieldError id={`${id}-error`} message={errorMessage(field)} />
            </div>
          ))}

          {saveError && (
            <p className="col-span-2 text-xs text-red-500">{saveError}</p>
          )}

          <div className="col-span-2 flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? '...' : 'Sauver'}
            </button>
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
