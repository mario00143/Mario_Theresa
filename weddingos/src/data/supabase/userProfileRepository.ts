import type { UserProfile } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { genericFromRow } from '@/data/adapters/genericMapper';
import type { Json } from '@/lib/supabase/database.types';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

export async function getMyProfile(): Promise<UserProfile | undefined> {
  const client = requireClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return undefined;
  const { data, error } = await client.from('user_profiles').select('*').eq('auth_user_id', auth.user.id).maybeSingle();
  if (error) throw error;
  return data ? genericFromRow<UserProfile>(data as Record<string, Json>) : undefined;
}

export async function updateMyProfile(patch: Pick<Partial<UserProfile>, 'displayName' | 'phone'>): Promise<void> {
  const client = requireClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error('Not signed in.');
  const row: Record<string, Json> = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.phone !== undefined) row.phone = patch.phone ?? null;
  const { error } = await client.from('user_profiles').update(row).eq('auth_user_id', auth.user.id);
  if (error) throw error;
}
