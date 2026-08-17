import type { OfflineMutation } from '@/types/offlineMutationQueue';

/** Observable singleton mirroring lib/syncStatus.ts's pattern — drives the "Pending Sync" / conflict UI for the offline mutation queue. */
export interface OfflineQueueState {
  mutations: OfflineMutation[];
  lastReplayAt?: string;
}

let state: OfflineQueueState = { mutations: [] };
const listeners = new Set<() => void>();

export function getOfflineQueueState(): OfflineQueueState {
  return state;
}

export function setOfflineQueueMutations(mutations: OfflineMutation[]): void {
  state = { ...state, mutations };
  for (const listener of listeners) listener();
}

export function markOfflineQueueReplayed(): void {
  state = { ...state, lastReplayAt: new Date().toISOString() };
  for (const listener of listeners) listener();
}

export function onOfflineQueueChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pendingCount(state: OfflineQueueState): number {
  return state.mutations.filter((m) => m.status === 'Pending' || m.status === 'Syncing' || m.status === 'Failed').length;
}

export function conflictCount(state: OfflineQueueState): number {
  return state.mutations.filter((m) => m.status === 'Conflict').length;
}
