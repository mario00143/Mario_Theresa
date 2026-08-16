import type { CeremonyItemMovement } from '@/types';
import { generateId } from '@/lib/id';
import { ceremonyItemMovementsStore } from '../stores';

export type NewCeremonyItemMovementInput = Omit<CeremonyItemMovement, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> & Partial<Pick<CeremonyItemMovement, 'timestamp'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addCeremonyItemMovement(input: NewCeremonyItemMovementInput): CeremonyItemMovement {
  const timestamp = nowISO();
  const movement: CeremonyItemMovement = {
    ...input,
    timestamp: input.timestamp ?? timestamp,
    id: generateId('movement'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  ceremonyItemMovementsStore.set((prev) => [...prev, movement]);
  return movement;
}

export function updateCeremonyItemMovement(id: string, patch: Partial<Omit<CeremonyItemMovement, 'id' | 'createdAt'>>): void {
  ceremonyItemMovementsStore.set((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: nowISO() } : m)));
}

export function deleteCeremonyItemMovement(id: string): void {
  ceremonyItemMovementsStore.set((prev) => prev.filter((m) => m.id !== id));
}
