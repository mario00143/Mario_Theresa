import type { ChurchProfile } from '@/types';
import { generateId } from '@/lib/id';
import { churchProfilesStore, churchRequirementsStore } from '../stores';

export type NewChurchProfileInput = Omit<ChurchProfile, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addChurchProfile(input: NewChurchProfileInput): ChurchProfile {
  const timestamp = nowISO();
  const profile: ChurchProfile = { ...input, id: generateId('church'), createdAt: timestamp, updatedAt: timestamp };
  churchProfilesStore.set((prev) => [...prev, profile]);
  return profile;
}

export function updateChurchProfile(id: string, patch: Partial<Omit<ChurchProfile, 'id' | 'createdAt'>>): void {
  churchProfilesStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

/** Deletes a church profile and cascades to its requirements. */
export function deleteChurchProfile(id: string): void {
  churchProfilesStore.set((prev) => prev.filter((p) => p.id !== id));
  churchRequirementsStore.set((prev) => prev.filter((r) => r.churchProfileId !== id));
}
