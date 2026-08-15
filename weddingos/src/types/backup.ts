import type { AppSettings } from './settings';
import type { Task } from './task';
import type { Decision } from './decision';
import type { Owner } from './owner';
import type { Household } from './household';
import type { Guest } from './guest';

/**
 * Version 1: settings/tasks/decisions/owners only (Phase 1).
 * Version 2: adds households/guests (Phase 2). Version 1 files still import
 * successfully — see backupRepository.migrateBackup — with households/guests
 * initialized to empty arrays.
 */
export const BACKUP_VERSION = 2;

export interface WeddingOSBackup {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  tasks: Task[];
  decisions: Decision[];
  owners: Owner[];
  households: Household[];
  guests: Guest[];
}
