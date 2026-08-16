import type { CloseoutItem, CloseoutStatus } from '@/types';
import { generateId } from '@/lib/id';
import { closeoutItemsStore } from '../stores';

export type NewCloseoutItemInput = Omit<CloseoutItem, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addCloseoutItem(input: NewCloseoutItemInput): CloseoutItem {
  const timestamp = nowISO();
  const item: CloseoutItem = { ...input, id: generateId('closeout'), createdAt: timestamp, updatedAt: timestamp };
  closeoutItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateCloseoutItem(id: string, patch: Partial<Omit<CloseoutItem, 'id' | 'createdAt'>>): void {
  closeoutItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

export function deleteCloseoutItem(id: string): void {
  closeoutItemsStore.set((prev) => prev.filter((i) => i.id !== id));
}

export function setCloseoutItemStatus(id: string, status: CloseoutStatus, verificationNote?: string): void {
  const timestamp = nowISO();
  closeoutItemsStore.set((prev) =>
    prev.map((i) =>
      i.id === id
        ? { ...i, status, verificationNote: verificationNote ?? i.verificationNote, completedAt: status === 'Complete' ? timestamp : i.completedAt, updatedAt: timestamp }
        : i,
    ),
  );
}
