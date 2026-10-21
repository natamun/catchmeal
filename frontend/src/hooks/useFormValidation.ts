import { useState } from 'react';

import { useTimeout } from './useTimeout';

const SUBMIT_ERRORS_MS = 5000;

/**
 * Holds a form's values and its validation state; every form of the app uses
 * it. A field gets its red border once touched, and its error bubble only while
 * it is focused, or for 5 seconds after a failed submit.
 *
 * attemptSubmit() reveals every error and returns whether the form can be sent;
 * resetValidation() starts over, e.g. when a dialog opens again.
 */
export function useFormValidation<T extends object>(
  initialForm: T | (() => T),
  validate: (form: T) => Partial<Record<keyof T, string>>,
) {
  const [form, setForm] = useState<T>(initialForm);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [focusedField, setFocusedField] = useState<keyof T | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useTimeout(
    () => setSubmitAttempted(false),
    submitAttempted ? SUBMIT_ERRORS_MS : null,
  );

  const errors = validate(form);

  const handleFocus = (field: keyof T) => setFocusedField(field);

  const handleBlur = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((current) => (current === field ? null : current));
  };

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isInvalid = (field: keyof T) =>
    Boolean(touched[field] && errors[field]);

  const errorMessage = (field: keyof T) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  const attemptSubmit = () => {
    setTouched(
      Object.fromEntries(
        Object.keys(form).map((key) => [key, true]),
      ) as Partial<Record<keyof T, boolean>>,
    );
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      setSubmitAttempted(true);
    }
    return isValid;
  };

  const resetValidation = () => {
    setTouched({});
    setFocusedField(null);
    setSubmitAttempted(false);
  };

  return {
    form,
    setForm,
    errors,
    submitAttempted,
    handleFocus,
    handleBlur,
    handleChange,
    isInvalid,
    errorMessage,
    attemptSubmit,
    resetValidation,
  };
}
