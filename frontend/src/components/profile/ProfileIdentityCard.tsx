import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

import type { AuthUser } from '../../auth/api';
import { useTimeout } from '../../hooks/useTimeout';
import {
  hasTooManyDecimals,
  parseDecimal,
  TOO_MANY_DECIMALS,
  WHOLE_NUMBER_ONLY,
} from '../../utils/decimals';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
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
  type UpdateProfileInput,
  type UserProfile,
} from './api';
import { BirthDatePicker } from './BirthDatePicker';

interface Props {
  user: AuthUser;
  onUpdate: (partial: Partial<AuthUser>) => void;
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

const GOAL_LIMITS = [
  { field: 'dailyCalorieGoal', min: 500, max: 10000, unit: 'kcal' },
  { field: 'dailyProteinGoal', min: 10, max: 500, unit: 'g' },
  { field: 'dailyCarbsGoal', min: 10, max: 2000, unit: 'g' },
  { field: 'dailyFatGoal', min: 10, max: 1000, unit: 'g' },
] as const;

function validate(form: FormState): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (form.username.trim().length < 3) errors.username = 'Minimum 3 caractères';
  else if (form.username.trim().length > 30)
    errors.username = 'Maximum 30 caractères';
  if (form.height) {
    const h = parseDecimal(form.height);
    if (h === null || isNaN(h)) errors.height = 'Valeur invalide';
    else if (h < 50 || h > 300) errors.height = 'Entre 50 et 300 cm';
    else if (hasTooManyDecimals(form.height)) errors.height = TOO_MANY_DECIMALS;
  }
  if (form.targetWeight) {
    const w = parseDecimal(form.targetWeight);
    if (w === null || isNaN(w)) errors.targetWeight = 'Valeur invalide';
    else if (w < 20 || w > 500) errors.targetWeight = 'Entre 20 et 500 kg';
    else if (hasTooManyDecimals(form.targetWeight))
      errors.targetWeight = TOO_MANY_DECIMALS;
  }
  for (const { field, min, max, unit } of GOAL_LIMITS) {
    if (!form[field]) continue;
    const value = parseDecimal(form[field]);
    if (value === null || isNaN(value)) errors[field] = 'Valeur invalide';
    else if (!Number.isInteger(value)) errors[field] = WHOLE_NUMBER_ONLY;
    else if (value < min || value > max)
      errors[field] = `Entre ${min} et ${max} ${unit}`;
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

export function ProfileIdentityCard({ user, onUpdate }: Props) {
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

    const input: UpdateProfileInput = {};

    const trimmedUsername = form.username.trim();
    const trimmedName = form.name.trim();
    if (trimmedUsername !== user.username) input.username = trimmedUsername;
    if (trimmedName !== (user.name ?? '')) input.name = trimmedName;
    const parsedHeight = parseDecimal(form.height) ?? undefined;
    if (parsedHeight !== (user.height ?? undefined))
      input.height = parsedHeight;
    const parsedTargetWeight = parseDecimal(form.targetWeight) ?? undefined;
    if (parsedTargetWeight !== (user.targetWeight ?? undefined))
      input.targetWeight = parsedTargetWeight;
    const parsedDailyCalorieGoal =
      parseDecimal(form.dailyCalorieGoal) ?? undefined;
    if (parsedDailyCalorieGoal !== (user.dailyCalorieGoal ?? undefined))
      input.dailyCalorieGoal = parsedDailyCalorieGoal;
    const parsedDailyProteinGoal =
      parseDecimal(form.dailyProteinGoal) ?? undefined;
    if (parsedDailyProteinGoal !== (user.dailyProteinGoal ?? undefined))
      input.dailyProteinGoal = parsedDailyProteinGoal;
    const parsedDailyCarbsGoal = parseDecimal(form.dailyCarbsGoal) ?? undefined;
    if (parsedDailyCarbsGoal !== (user.dailyCarbsGoal ?? undefined))
      input.dailyCarbsGoal = parsedDailyCarbsGoal;
    const parsedDailyFatGoal = parseDecimal(form.dailyFatGoal) ?? undefined;
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
      setSaveError(requestErrorMessage(err, 'Erreur lors de la sauvegarde'));
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-green-800">
              {user.username}
            </p>
            {user.name && (
              <p className="truncate text-xs text-green-500">{user.name}</p>
            )}
          </div>
          <EditIconButton
            label="Modifier le profil"
            onClick={handleEdit}
            size="lg"
          />
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

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="col-span-2 mt-2 w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </BaseDialog>
    </>
  );
}
