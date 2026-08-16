/** Drives the small Synced/Saving/Offline/Sync Error indicator (section 29). */
export const SYNC_STATUSES = ['synced', 'saving', 'offline', 'error'] as const;
export type SyncStatusValue = (typeof SYNC_STATUSES)[number];

export interface SyncStatusState {
  status: SyncStatusValue;
  message?: string;
  lastSyncedAt?: string;
}

let state: SyncStatusState = { status: 'synced' };
const listeners = new Set<() => void>();

export function getSyncStatus(): SyncStatusState {
  return state;
}

export function setSyncStatus(status: SyncStatusValue, message?: string): void {
  state = {
    status,
    message,
    lastSyncedAt: status === 'synced' ? new Date().toISOString() : state.lastSyncedAt,
  };
  for (const listener of listeners) listener();
}

export function onSyncStatusChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
