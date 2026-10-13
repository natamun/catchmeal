import { ApiError } from './request';

const MESSAGES: Record<number, string> = {
  400: 'Certaines informations ne sont pas valides. Vérifiez les champs.',
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: "Cette action n'est pas autorisée.",
  404: "Cet élément n'existe plus.",
  429: 'Trop de demandes. Réessayez dans un instant.',
};

const CONFLICT = 409;

export function requestErrorMessage(
  error: unknown,
  fallback: string,
  overrides: Record<number, string> = {},
) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  const { status } = error;

  return (
    overrides[status] ??
    (status === CONFLICT ? error.message : MESSAGES[status]) ??
    fallback
  );
}
