import type { AttireItem } from '@/types';
import { generateId } from '@/lib/id';
import { attireItemsStore } from '../stores';

export type NewAttireItemInput = Omit<AttireItem, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addAttireItem(input: NewAttireItemInput): AttireItem {
  const timestamp = nowISO();
  const item: AttireItem = { ...input, id: generateId('attireitem'), createdAt: timestamp, updatedAt: timestamp };
  attireItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateAttireItem(id: string, patch: Partial<Omit<AttireItem, 'id' | 'createdAt'>>): void {
  attireItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

export function deleteAttireItem(id: string): void {
  attireItemsStore.set((prev) => prev.filter((i) => i.id !== id));
}
