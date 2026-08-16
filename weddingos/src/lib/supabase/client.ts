import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when both public env vars are present and non-empty. This is
 * the single source of truth the rest of the app uses to decide between
 * Demo/Local Mode and Production Supabase Mode — see runtimeSession.ts.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Lazily creates a single shared Supabase client. Returns null when env
 * vars are missing so callers (which should already be checking
 * isSupabaseConfigured()) fail gracefully instead of throwing at import
 * time — this keeps `npm run dev` with no .env.local working.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient<Database>(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}
