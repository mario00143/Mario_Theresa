/**
 * SHA-256 hex digest via the Web Crypto API, matching Postgres's
 * `encode(digest(token, 'sha256'), 'hex')` exactly (lowercase hex, no
 * separators) — used so an invite token can be hashed client-side before
 * ever reaching the network, while still being verifiable server-side by
 * accept_workspace_invite() (supabase/migrations/..._rpc_functions.sql).
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** A random, URL-safe invite token (section 20: "should be random"). */
export function generateInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
