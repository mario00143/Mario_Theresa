import type { AttireProfile } from '@/types';
import { generateId } from '@/lib/id';
import { attireItemsStore, attireProfilesStore } from '../stores';

export type NewAttireProfileInput = Omit<AttireProfile, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addAttireProfile(input: NewAttireProfileInput): AttireProfile {
  const timestamp = nowISO();
  const profile: AttireProfile = { ...input, id: generateId('attire'), createdAt: timestamp, updatedAt: timestamp };
  attireProfilesStore.set((prev) => [...prev, profile]);
  return profile;
}

export function updateAttireProfile(id: string, patch: Partial<Omit<AttireProfile, 'id' | 'createdAt'>>): void {
  attireProfilesStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

/** Deletes an attire profile and cascades to its items. */
export function deleteAttireProfile(id: string): void {
  attireProfilesStore.set((prev) => prev.filter((p) => p.id !== id));
  attireItemsStore.set((prev) => prev.filter((i) => i.attireProfileId !== id));
}
