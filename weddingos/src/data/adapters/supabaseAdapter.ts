import { getSupabaseClient } from '@/lib/supabase/client';
import type { Json } from '@/lib/supabase/database.types';
import { getRuntimeSession } from '@/lib/runtimeSession';
import type { RepositoryAdapter } from './types';
import type { EntityRowMap } from './rowMap';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

function requireWorkspaceId(): string {
  const { workspaceId } = getRuntimeSession();
  if (!workspaceId) throw new Error('No active workspace selected.');
  return workspaceId;
}

/** Generic Supabase-backed RepositoryAdapter, parameterized entirely by an EntityRowMap. */
export function createSupabaseAdapter<T extends { id: string }>(map: EntityRowMap<T>): RepositoryAdapter<T> {
  async function get(id: string): Promise<T | undefined> {
    const { data, error } = await requireClient()
      .from(map.table)
      .select('*')
      .eq('workspace_id', requireWorkspaceId())
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? map.fromRow(data as Record<string, Json>) : undefined;
  }

  return {
    async list() {
      const { data, error } = await requireClient().from(map.table).select('*').eq('workspace_id', requireWorkspaceId());
      if (error) throw error;
      return (data ?? []).map((row) => map.fromRow(row as Record<string, Json>));
    },
    get,
    async create(record) {
      const { userId } = getRuntimeSession();
      const row = map.toRow(record, requireWorkspaceId(), userId);
      const { data, error } = await requireClient().from(map.table).insert(row).select().single();
      if (error) throw error;
      return map.fromRow(data as Record<string, Json>);
    },
    async update(id, patch) {
      const existing = await get(id);
      if (!existing) throw new Error(`Record ${id} not found`);
      const merged = { ...existing, ...patch } as T;
      const { userId } = getRuntimeSession();
      const row = map.toRow(merged, requireWorkspaceId(), userId);
      const { data, error } = await requireClient()
        .from(map.table)
        .update(row)
        .eq('workspace_id', requireWorkspaceId())
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return map.fromRow(data as Record<string, Json>);
    },
    async remove(id) {
      const { error } = await requireClient().from(map.table).delete().eq('workspace_id', requireWorkspaceId()).eq('id', id);
      if (error) throw error;
    },
  };
}
