import type { CeremonyItem } from '@/types';
import { generateId } from '@/lib/id';
import { ceremonyItemMovementsStore, ceremonyItemsStore, ceremonySequenceItemsStore, runSheetItemsStore } from '../stores';

export type NewCeremonyItemInput = Omit<CeremonyItem, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addCeremonyItem(input: NewCeremonyItemInput): CeremonyItem {
  const timestamp = nowISO();
  const item: CeremonyItem = { ...input, id: generateId('ceritem'), createdAt: timestamp, updatedAt: timestamp };
  ceremonyItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateCeremonyItem(id: string, patch: Partial<Omit<CeremonyItem, 'id' | 'createdAt'>>): void {
  ceremonyItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

/**
 * Deletes a ceremony item, removes it from any sequence item's
 * required-items list and any run-sheet item's requiredItemIds, and
 * cascades to its day-of movement history (Phase 6) since a movement
 * record is meaningless without the item it tracks.
 */
export function deleteCeremonyItem(id: string): void {
  ceremonyItemsStore.set((prev) => prev.filter((i) => i.id !== id));
  ceremonySequenceItemsStore.set((prev) =>
    prev.map((s) => (s.requiredItems.includes(id) ? { ...s, requiredItems: s.requiredItems.filter((r) => r !== id), updatedAt: nowISO() } : s)),
  );
  runSheetItemsStore.set((prev) =>
    prev.map((r) => (r.requiredItemIds.includes(id) ? { ...r, requiredItemIds: r.requiredItemIds.filter((i) => i !== id), updatedAt: nowISO() } : r)),
  );
  ceremonyItemMovementsStore.set((prev) => prev.filter((m) => m.ceremonyItemId !== id));
}

/** Marks an item verified (section 10/11's custody verification workflow). */
export function verifyCeremonyItem(id: string): void {
  const timestamp = nowISO();
  ceremonyItemsStore.set((prev) =>
    prev.map((i) => (i.id === id ? { ...i, verificationStatus: 'Verified', lastVerifiedAt: timestamp, updatedAt: timestamp } : i)),
  );
}
