import { useState, type FormEvent, type RefObject } from 'react';

import { ApiError } from '../../utils/request';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import {
  MAX_LENGTH,
  maxLengthMessage,
  MIN_LENGTH,
  minLengthMessage,
} from '../../utils/validation';
import { BaseDialog } from '../ui/BaseDialog';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { changePassword } from './api';

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type Field = keyof FormState;

const EMPTY_FORM: FormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/**
 * Current password required; the new one 8 to 72 characters and different from
 * the current one; the confirmation identical.
 */
function validate(form: FormState) {
  const errors: Partial<Record<Field, string>> = {};

  if (form.currentPassword.length === 0) {
    errors.currentPassword = 'Saisissez votre mot de passe actuel';
  }

  if (form.newPassword.length < MIN_LENGTH.password) {
    errors.newPassword = minLengthMessage(MIN_LENGTH.password);
  } else if (form.newPassword.length > MAX_LENGTH.password) {
    errors.newPassword = maxLengthMessage(MAX_LENGTH.password);
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword =
      "Le nouveau mot de passe doit être différent de l'ancien";
  }

  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Les deux mots de passe ne correspondent pas';
  }

  return errors;
}

/**
 * A 400 is the backend saying the current password is wrong: its message is
 * shown as is.
 */
function submitErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 400) {
    return error.message;
  }
  return requestErrorMessage(
    error,
    'Impossible de changer le mot de passe. Réessayez.',
  );
}

interface ChangePasswordDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onSuccess: () => void;
}

/**
 * Dialog to change the password, offered to accounts that have one. Errors show
 * only after a first submit.
 */
export function ChangePasswordDialog({
  dialogRef,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = validate(form);
  const firstError = Object.values(errors)[0];
  const visibleError =
    serverError ?? (submitAttempted ? firstError : undefined);

  const isInvalid = (field: Field) => submitAttempted && Boolean(errors[field]);

  function handleChange(field: Field, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
  }

  function reset() {
    setForm(EMPTY_FORM);
    setSubmitAttempted(false);
    setServerError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;

    if (firstError) {
      setSubmitAttempted(true);
      return;
    }

    setSaving(true);
    setServerError(null);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      dialogRef.current?.close();
      onSuccess();
    } catch (error) {
      setServerError(submitErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title="Changer le mot de passe"
      maxWidth="sm"
      onClose={reset}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField label="Mot de passe actuel">
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              aria-invalid={isInvalid('currentPassword')}
            />
          )}
        </FormField>

        <FormField label="Nouveau mot de passe">
          {(id) => (
            <>
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                aria-invalid={isInvalid('newPassword')}
                aria-describedby={`${id}-hint`}
              />
              <p id={`${id}-hint`} className="text-xs text-green-500">
                {minLengthMessage(MIN_LENGTH.password)}
              </p>
            </>
          )}
        </FormField>

        <FormField label="Confirmer le nouveau mot de passe">
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              aria-invalid={isInvalid('confirmPassword')}
            />
          )}
        </FormField>

        {visibleError && (
          <p role="alert" className="test-sm test-red-500">
            {visibleError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={saving}
            className="w-full cursor-pointer rounded-xl bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </BaseDialog>
  );
}
