import type { DataMigration } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { genericFromRow, genericToRow } from '@/data/adapters/genericMapper';
import type { Json } from '@/lib/supabase/database.types';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

/** The idempotency check (section 32) — a Completed/Verified row for this exact fingerprint blocks a duplicate migration. */
export async function findCompletedMigration(workspaceId: string, sourceFingerprint: string): Promise<DataMigration | undefined> {
  const { data, error } = await requireClient()
    .from('data_migrations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('source_fingerprint', sourceFingerprint)
    .in('status', ['Completed', 'Verified'])
    .maybeSingle();
  if (error) throw error;
  return data ? genericFromRow<DataMigration>(data as Record<string, Json>) : undefined;
}

export async function createMigrationRecord(migration: Omit<DataMigration, 'id'>): Promise<DataMigration> {
  const row = genericToRow(migration as unknown as Record<string, unknown>, migration.workspaceId, null);
  const { data, error } = await requireClient().from('data_migrations').insert(row).select().single();
  if (error) throw error;
  return genericFromRow<DataMigration>(data as Record<string, Json>);
}

export async function updateMigrationRecord(id: string, patch: Partial<DataMigration>): Promise<void> {
  const row = genericToRow(patch as Record<string, unknown>, '', null);
  delete row.workspace_id;
  const { error } = await requireClient().from('data_migrations').update(row).eq('id', id);
  if (error) throw error;
}

export async function listMigrations(workspaceId: string): Promise<DataMigration[]> {
  const { data, error } = await requireClient()
    .from('data_migrations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => genericFromRow<DataMigration>(row as Record<string, Json>));
}
