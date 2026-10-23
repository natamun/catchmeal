/** Provider accounts without an email get a made-up address on this domain. */
const NO_EMAIL_DOMAIN = '@noemail.invalid';

/** A made-up address is unique per provider account, it cannot point to someone else. */
export function isPlaceholderEmail(email: string): boolean {
  return email.endsWith(NO_EMAIL_DOMAIN);
}
