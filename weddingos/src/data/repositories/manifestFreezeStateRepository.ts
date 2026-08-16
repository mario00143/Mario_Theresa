import type { ManifestFreezeState, ManifestType } from '@/types';
import { generateId } from '@/lib/id';
import { manifestFreezeStatesStore } from '../stores';

function nowISO(): string {
  return new Date().toISOString();
}

/** Finds or lazily creates the freeze-state row for a manifest type — there is exactly one per type. */
function findOrCreate(manifestType: ManifestType): ManifestFreezeState {
  const existing = manifestFreezeStatesStore.get().find((s) => s.manifestType === manifestType);
  if (existing) return existing;
  const timestamp = nowISO();
  const created: ManifestFreezeState = { id: generateId('freeze'), manifestType, frozen: false, createdAt: timestamp, updatedAt: timestamp };
  manifestFreezeStatesStore.set((prev) => [...prev, created]);
  return created;
}

export function getManifestFreezeState(manifestType: ManifestType): ManifestFreezeState {
  return findOrCreate(manifestType);
}

export function freezeManifest(manifestType: ManifestType, frozenBy: string): void {
  findOrCreate(manifestType);
  const timestamp = nowISO();
  manifestFreezeStatesStore.set((prev) =>
    prev.map((s) => (s.manifestType === manifestType ? { ...s, frozen: true, frozenAt: timestamp, frozenBy, updatedAt: timestamp } : s)),
  );
}

export function unfreezeManifest(manifestType: ManifestType): void {
  findOrCreate(manifestType);
  manifestFreezeStatesStore.set((prev) =>
    prev.map((s) => (s.manifestType === manifestType ? { ...s, frozen: false, frozenAt: undefined, frozenBy: undefined, updatedAt: nowISO() } : s)),
  );
}
