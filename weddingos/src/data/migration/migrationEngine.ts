import type { WeddingOSBackup } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { genericToRow } from '@/data/adapters/genericMapper';
import { LEGACY_ENTITY_TABLES, type LegacyEntityKey } from '@/data/supabase/entityRegistry';
import { saveWorkspaceSettings } from '@/data/supabase/workspaceSettingsRepository';
import { sha256Hex } from '@/lib/hashToken';
import { MIGRATION_ORDER } from './migrationOrder';

const BATCH_SIZE = 500;

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

/** Deterministic fingerprint of the local dataset's content (excludes exportedAt, which changes every export) — section 32's idempotency key. */
export async function computeLocalDataFingerprint(backup: WeddingOSBackup): Promise<string> {
  const { exportedAt: _exportedAt, ...stable } = backup;
  const canonical = JSON.stringify(stable, Object.keys(stable).sort());
  return sha256Hex(canonical);
}

export function getLocalRecordCounts(backup: WeddingOSBackup): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const key of MIGRATION_ORDER) {
    counts[key] = (backup[key] as unknown as { id: string }[]).length;
  }
  return counts;
}

/** Every guest/vendor/etc. id referenced by another collection must exist somewhere in the backup — a broken-reference check before writing anything (section 31 "validate references"). */
export function validateReferences(backup: WeddingOSBackup): string[] {
  const problems: string[] = [];
  const householdIds = new Set(backup.households.map((h) => h.id));
  const guestIds = new Set(backup.guests.map((g) => g.id));
  const hotelIds = new Set(backup.hotels.map((h) => h.id));
  const vendorIds = new Set(backup.vendors.map((v) => v.id));

  for (const guest of backup.guests) {
    if (!householdIds.has(guest.householdId)) problems.push(`Guest "${guest.fullName}" references missing household ${guest.householdId}`);
  }
  for (const room of backup.rooms) {
    if (!hotelIds.has(room.hotelId)) problems.push(`Room ${room.roomNumber} references missing hotel ${room.hotelId}`);
  }
  for (const assignment of backup.roomAssignments) {
    if (!guestIds.has(assignment.guestId)) problems.push(`Room assignment ${assignment.id} references missing guest ${assignment.guestId}`);
  }
  for (const contact of backup.vendorContacts) {
    if (!vendorIds.has(contact.vendorId)) problems.push(`Vendor contact "${contact.name}" references missing vendor ${contact.vendorId}`);
  }
  for (const payment of backup.payments) {
    if (!vendorIds.has(payment.vendorId)) problems.push(`Payment ${payment.id} references missing vendor ${payment.vendorId}`);
  }
  return problems;
}

export interface MigrationProgress {
  key: LegacyEntityKey;
  index: number;
  total: number;
}

/** Pushes every collection to Supabase in referential order (section 34), preserving each record's existing id (section 33). Upserts so a retried run after a partial failure never duplicates rows. */
export async function migrateAllCollections(
  workspaceId: string,
  backup: WeddingOSBackup,
  onProgress?: (progress: MigrationProgress) => void,
): Promise<Record<string, number>> {
  const client = requireClient();
  const pushedCounts: Record<string, number> = {};

  await saveWorkspaceSettings(workspaceId, backup.settings);

  for (let i = 0; i < MIGRATION_ORDER.length; i++) {
    const key = MIGRATION_ORDER[i];
    onProgress?.({ key, index: i, total: MIGRATION_ORDER.length });
    const records = backup[key] as unknown as Array<{ id: string }>;
    const table = LEGACY_ENTITY_TABLES[key];
    let pushed = 0;
    for (let offset = 0; offset < records.length; offset += BATCH_SIZE) {
      const chunk = records.slice(offset, offset + BATCH_SIZE);
      const rows = chunk.map((record) => genericToRow(record as unknown as Record<string, unknown>, workspaceId, null));
      const { error } = await client.from(table).upsert(rows);
      if (error) throw new Error(`Failed to migrate ${key} (batch starting at ${offset}): ${error.message}`);
      pushed += chunk.length;
    }
    pushedCounts[key] = pushed;
  }

  return pushedCounts;
}

/** Re-queries Supabase's actual row counts per collection and compares to what was migrated (section 35). */
export async function verifyMigration(workspaceId: string, sourceCounts: Record<string, number>): Promise<{ key: string; source: number; destination: number }[]> {
  const client = requireClient();
  const results: { key: string; source: number; destination: number }[] = [];
  for (const key of MIGRATION_ORDER) {
    const table = LEGACY_ENTITY_TABLES[key];
    const { count, error } = await client.from(table).select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId);
    if (error) throw error;
    results.push({ key, source: sourceCounts[key] ?? 0, destination: count ?? 0 });
  }
  return results;
}
