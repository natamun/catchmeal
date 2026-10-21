import { ApiError } from './request';

/** French messages for the HTTP statuses a user can actually meet. */
const MESSAGES: Record<number, string> = {
  400: 'Certaines informations ne sont pas valides. Vérifiez les champs.',
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: "Cette action n'est pas autorisée.",
  404: "Cet élément n'existe plus.",
  429: 'Trop de demandes. Réessayez dans un instant.',
};

const CONFLICT = 409;

/**
 * Turns a failed request into a French message for the user. Priority: the
 * caller's override for that status, then the backend's own message for a 409
 * conflict (already written for users, e.g. "Ce nom d'utilisateur est déjà
 * pris"), then the generic message of the status, then the fallback (network
 * down, server error...).
 */
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
