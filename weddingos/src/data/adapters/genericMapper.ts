import type { Json } from '@/lib/supabase/database.types';

/** Handles both plain camelCase (roomTypes -> room_types) and acronym runs (musicAVPlans -> music_av_plans). */
function camelToSnake(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}

/**
 * Generic camelCase(TS) -> snake_case(Postgres) row converter. Works for
 * every entity in this app because every SQL column name in
 * supabase/migrations/ was deliberately chosen as the exact snake_case
 * form of its TypeScript field name — see EntityRowMap (rowMap.ts) for
 * why this one generic, tested converter is preferred here over 40+
 * hand-written near-duplicate mapper files. Per-entity quirks (a field
 * that legitimately needs different handling) get a thin wrapper around
 * this function rather than a full bespoke mapper — see
 * data/supabase/entityRegistry.ts for the couple of entities that do.
 *
 * Known limitation: Postgres `time` columns echo back `HH:mm:ss` even
 * when the app only ever writes `HH:mm` — call sites that compare a
 * round-tripped time string for exact equality should format it first
 * (utils/date.ts already does this everywhere times are displayed).
 */
export function genericToRow<T extends Record<string, unknown>>(
  record: T,
  workspaceId: string,
  userId: string | null,
): Record<string, Json> {
  const row: Record<string, Json> = { workspace_id: workspaceId };
  for (const [key, value] of Object.entries(record)) {
    row[camelToSnake(key)] = (value === undefined ? null : value) as Json;
  }
  if (userId) {
    row.updated_by = userId;
  }
  return row;
}

export function genericFromRow<T>(row: Record<string, Json>): T {
  const record: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'workspace_id' || key === 'created_by' || key === 'updated_by') continue;
    record[snakeToCamel(key)] = value === null ? undefined : value;
  }
  return record as T;
}
