import type { Store } from './store';
import type { EntityRowMap } from '@/data/adapters/rowMap';
import type { Json } from './supabase/database.types';
import { getSupabaseClient } from './supabase/client';
import { getRuntimeSession, isSupabaseSyncActive } from './runtimeSession';
import { setSyncStatus } from './syncStatus';

export type { EntityRowMap };

export interface SyncedStore<T> extends Store<T[]> {
  /** Populates the store from a Supabase fetch WITHOUT pushing a diff back up — used only by bootstrap hydration. */
  hydrate: (rows: T[]) => void;
  map: EntityRowMap<T>;
}

/**
 * Makes an existing localStorage-backed Store<T[]> Supabase-capable without
 * changing its type or any call site. `.get()`/`.subscribe()` pass through
 * unchanged; `.set()` still writes to localStorage first (so Demo/Local
 * Mode and the offline cache keep working exactly as before), and — only
 * when isSupabaseSyncActive() — also diffs the previous/next array and
 * pushes an upsert/delete to Supabase in the background. This is how all
 * 46 pre-existing v1-v6 domain stores gain Supabase sync (section 23)
 * without any of their repository functions, hooks, or UI components
 * being touched (section 21's "avoid rewriting all UI modules").
 *
 * This is deliberately optimistic (the local write always applies first):
 * section 30 calls out a short list of flows that must NOT be optimistic
 * (payments, room/vehicle assignment, member role changes, destructive
 * deletes) — those go through the dedicated confirm-first helpers in
 * data/confirmedWrites.ts instead of relying on this generic path.
 */
export function withSupabaseSync<T extends { id: string }>(store: Store<T[]>, map: EntityRowMap<T>): SyncedStore<T> {
  return {
    get: store.get,
    subscribe: store.subscribe,
    set: (value) => {
      const prev = store.get();
      store.set(value);
      if (!isSupabaseSyncActive()) return;
      const next = store.get();
      void pushDiff(prev, next, map);
    },
    hydrate: (rows) => store.set(rows),
    map,
  };
}

async function pushDiff<T extends { id: string }>(prev: T[], next: T[], map: EntityRowMap<T>): Promise<void> {
  const client = getSupabaseClient();
  const { workspaceId, userId } = getRuntimeSession();
  if (!client || !workspaceId) return;

  const prevById = new Map(prev.map((record) => [record.id, record]));
  const nextIds = new Set(next.map((record) => record.id));
  const removedIds = [...prevById.keys()].filter((id) => !nextIds.has(id));
  // Reference inequality is a valid "did this record change" check because
  // every repository function in this codebase does immutable updates
  // (prev.map(r => r.id === id ? { ...r, ...patch } : r)) — untouched
  // records keep their exact object reference.
  const changed = next.filter((record) => prevById.get(record.id) !== record);

  if (changed.length === 0 && removedIds.length === 0) return;

  setSyncStatus('saving');
  try {
    if (changed.length > 0) {
      const rows = changed.map((record) => map.toRow(record, workspaceId, userId));
      const { error } = await client.from(map.table).upsert(rows);
      if (error) throw error;
    }
    if (removedIds.length > 0) {
      const { error } = await client.from(map.table).delete().eq('workspace_id', workspaceId).in('id', removedIds);
      if (error) throw error;
    }
    setSyncStatus('synced');
  } catch (err) {
    setSyncStatus('error', err instanceof Error ? err.message : 'Sync failed');
  }
}

/** Fetches every row for a workspace and hydrates the store — used once at bootstrap and on workspace switch. */
export async function hydrateSyncedStore<T extends { id: string }>(store: SyncedStore<T>): Promise<void> {
  const client = getSupabaseClient();
  const { workspaceId } = getRuntimeSession();
  if (!client || !workspaceId) return;
  const { data, error } = await client.from(store.map.table).select('*').eq('workspace_id', workspaceId);
  if (error) {
    setSyncStatus('error', error.message);
    return;
  }
  store.hydrate((data ?? []).map((row) => store.map.fromRow(row as Record<string, Json>)));
}
