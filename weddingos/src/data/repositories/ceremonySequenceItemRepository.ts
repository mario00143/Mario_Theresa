import type { CeremonySequenceItem } from '@/types';
import { generateId } from '@/lib/id';
import { ceremonySequenceItemsStore } from '../stores';

export type NewCeremonySequenceItemInput = Omit<CeremonySequenceItem, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'requiredItems'> &
  Partial<Pick<CeremonySequenceItem, 'participants' | 'requiredItems'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addCeremonySequenceItem(input: NewCeremonySequenceItemInput): CeremonySequenceItem {
  const timestamp = nowISO();
  const item: CeremonySequenceItem = {
    ...input,
    participants: input.participants ?? [],
    requiredItems: input.requiredItems ?? [],
    id: generateId('sequence'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  ceremonySequenceItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateCeremonySequenceItem(id: string, patch: Partial<Omit<CeremonySequenceItem, 'id' | 'createdAt'>>): void {
  ceremonySequenceItemsStore.set((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: nowISO() } : s)));
}

export function deleteCeremonySequenceItem(id: string): void {
  ceremonySequenceItemsStore.set((prev) => prev.filter((s) => s.id !== id));
}

/** Swaps sequenceOrder with the immediate neighbor in the given direction (up/down ordering controls, section 9). */
export function reorderCeremonySequenceItem(id: string, direction: 'up' | 'down'): void {
  const timestamp = nowISO();
  ceremonySequenceItemsStore.set((prev) => {
    const sorted = [...prev].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const index = sorted.findIndex((s) => s.id === id);
    if (index === -1) return prev;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return prev;

    const current = sorted[index];
    const swapWith = sorted[swapIndex];
    return prev.map((s) => {
      if (s.id === current.id) return { ...s, sequenceOrder: swapWith.sequenceOrder, updatedAt: timestamp };
      if (s.id === swapWith.id) return { ...s, sequenceOrder: current.sequenceOrder, updatedAt: timestamp };
      return s;
    });
  });
}
