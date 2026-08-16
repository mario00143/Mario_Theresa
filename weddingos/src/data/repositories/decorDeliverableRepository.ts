import type { DecorDeliverable } from '@/types';
import { generateId } from '@/lib/id';
import { decorDeliverablesStore } from '../stores';

export type NewDecorDeliverableInput = Omit<DecorDeliverable, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addDecorDeliverable(input: NewDecorDeliverableInput): DecorDeliverable {
  const timestamp = nowISO();
  const deliverable: DecorDeliverable = { ...input, id: generateId('decoritem'), createdAt: timestamp, updatedAt: timestamp };
  decorDeliverablesStore.set((prev) => [...prev, deliverable]);
  return deliverable;
}

export function updateDecorDeliverable(id: string, patch: Partial<Omit<DecorDeliverable, 'id' | 'createdAt'>>): void {
  decorDeliverablesStore.set((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowISO() } : d)));
}

export function deleteDecorDeliverable(id: string): void {
  decorDeliverablesStore.set((prev) => prev.filter((d) => d.id !== id));
}
