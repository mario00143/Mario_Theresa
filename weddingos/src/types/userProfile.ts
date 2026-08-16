/**
 * A public-facing profile row for an authenticated user. Deliberately
 * excludes auth internals (password hash, provider tokens, etc.) — those
 * stay inside Supabase Auth's own `auth.users` table, never duplicated here.
 */
export interface UserProfile {
  id: string;
  authUserId: string;
  displayName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
