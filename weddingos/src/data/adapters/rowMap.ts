import type { Json } from '@/lib/supabase/database.types';

/**
 * Dedicated camelCase(TS) <-> snake_case(Postgres) mapper contract for one
 * entity (section 22). Shared by both the standalone RepositoryAdapter
 * (data/adapters/supabaseAdapter.ts, used by Phase-7-native entities) and
 * the store-sync wrapper (lib/supabaseSync.ts, used by the pre-existing
 * v1-v6 entities) so there's exactly one mapper shape in the codebase.
 */
export interface EntityRowMap<T> {
  table: string;
  toRow: (record: T, workspaceId: string, userId: string | null) => Record<string, Json>;
  fromRow: (row: Record<string, Json>) => T;
}
