import type { CeremonyItem } from '@/types';
import { generateId } from '@/lib/id';
import { ceremonyItemsStore, ceremonySequenceItemsStore } from '../stores';

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

/** Deletes a ceremony item and removes it from any sequence item's required-items list. */
export function deleteCeremonyItem(id: string): void {
  ceremonyItemsStore.set((prev) => prev.filter((i) => i.id !== id));
  ceremonySequenceItemsStore.set((prev) =>
    prev.map((s) => (s.requiredItems.includes(id) ? { ...s, requiredItems: s.requiredItems.filter((r) => r !== id), updatedAt: nowISO() } : s)),
  );
}

/** Marks an item verified (section 10/11's custody verification workflow). */
export function verifyCeremonyItem(id: string): void {
  const timestamp = nowISO();
  ceremonyItemsStore.set((prev) =>
    prev.map((i) => (i.id === id ? { ...i, verificationStatus: 'Verified', lastVerifiedAt: timestamp, updatedAt: timestamp } : i)),
  );
}
