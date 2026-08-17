import { readRaw, writeRaw } from './storage';

const KEY = 'lastBackupExportedAt';

/** Device-local record of "a backup was downloaded from this device" — used by the Production Readiness screen and Wedding Week System Checklist to flag a stale/missing backup. Not itself part of any backup (it would be meaningless inside one). */
export function recordBackupExported(): void {
  writeRaw(KEY, new Date().toISOString());
}

export function getLastBackupExportedAt(): string | null {
  return readRaw(KEY);
}
