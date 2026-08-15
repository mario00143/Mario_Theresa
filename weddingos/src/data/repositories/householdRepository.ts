import type { Household } from '@/types';
import { generateId } from '@/lib/id';
import { guestsStore, householdsStore } from '../stores';

export type NewHouseholdInput = Omit<Household, 'id' | 'createdAt' | 'updatedAt' | 'invitedEvents' | 'invitationMethod'> &
  Partial<Pick<Household, 'invitedEvents' | 'invitationMethod'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addHousehold(input: NewHouseholdInput): Household {
  const timestamp = nowISO();
  const household: Household = {
    ...input,
    id: generateId('household'),
    invitedEvents: input.invitedEvents ?? [],
    invitationMethod: input.invitationMethod ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  householdsStore.set((prev) => [...prev, household]);
  return household;
}

export function updateHousehold(id: string, patch: Partial<Omit<Household, 'id' | 'createdAt'>>): void {
  householdsStore.set((prev) =>
    prev.map((household) => (household.id === id ? { ...household, ...patch, updatedAt: nowISO() } : household)),
  );
}

export function countGuestsForHousehold(householdId: string): number {
  return guestsStore.get().filter((guest) => guest.householdId === householdId).length;
}

/** Deletes a household and cascades — every guest belonging to it is deleted too. */
export function deleteHousehold(id: string): void {
  householdsStore.set((prev) => prev.filter((household) => household.id !== id));
  guestsStore.set((prev) => prev.filter((guest) => guest.householdId !== id));
}
