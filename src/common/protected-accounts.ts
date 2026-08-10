/**
 * The MIUM service account. MaHIS-Core logs in as this user server-side to
 * authorise the Integrated User Management screens, so its credentials are
 * infrastructure rather than an ordinary user record: they are changed only by
 * the server administrator via `npm run prisma:set-admin-password`, never
 * through the API.
 */
export const PROTECTED_USERNAME = 'admin';

export function isProtectedAccount(username?: string | null): boolean {
  return username?.trim().toLowerCase() === PROTECTED_USERNAME;
}
