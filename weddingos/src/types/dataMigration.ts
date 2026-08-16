export const DATA_MIGRATION_SOURCE_TYPES = ['localStorage'] as const;
export type DataMigrationSourceType = (typeof DATA_MIGRATION_SOURCE_TYPES)[number];

export const DATA_MIGRATION_STATUSES = ['Analyzing', 'In Progress', 'Verified', 'Completed', 'Failed', 'Blocked'] as const;
export type DataMigrationStatus = (typeof DATA_MIGRATION_STATUSES)[number];

/** Per-collection row counts captured at migration time, for the verification screen (section 35). */
export type MigrationRecordCounts = Record<string, { source: number; destination: number }>;

/**
 * Tracks one local-WeddingOS-backup -> Supabase-workspace migration
 * (section 32). `sourceFingerprint` is a deterministic hash of the local
 * backup content, used purely to detect "this exact local dataset was
 * already migrated" and block accidental duplication.
 */
export interface DataMigration {
  id: string;
  workspaceId: string;
  sourceType: DataMigrationSourceType;
  sourceVersion: number;
  sourceFingerprint: string;
  startedAt: string;
  completedAt?: string;
  status: DataMigrationStatus;
  recordCounts: MigrationRecordCounts;
  errorSummary?: string;
}
