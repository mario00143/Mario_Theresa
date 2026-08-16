import type { ChurchRequirement } from '@/types';
import { generateId } from '@/lib/id';
import { churchRequirementsStore } from '../stores';

export type NewChurchRequirementInput = Omit<ChurchRequirement, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addChurchRequirement(input: NewChurchRequirementInput): ChurchRequirement {
  const timestamp = nowISO();
  const requirement: ChurchRequirement = { ...input, id: generateId('churchreq'), createdAt: timestamp, updatedAt: timestamp };
  churchRequirementsStore.set((prev) => [...prev, requirement]);
  return requirement;
}

export function updateChurchRequirement(id: string, patch: Partial<Omit<ChurchRequirement, 'id' | 'createdAt'>>): void {
  churchRequirementsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r)));
}

export function deleteChurchRequirement(id: string): void {
  churchRequirementsStore.set((prev) => prev.filter((r) => r.id !== id));
}

/** Marks a requirement's document verified (section 7's document-verification workflow). */
export function verifyChurchRequirement(id: string, verifiedBy: string): void {
  const timestamp = nowISO();
  churchRequirementsStore.set((prev) =>
    prev.map((r) => (r.id === id ? { ...r, status: 'Verified', verifiedDate: timestamp, verifiedBy, updatedAt: timestamp } : r)),
  );
}
