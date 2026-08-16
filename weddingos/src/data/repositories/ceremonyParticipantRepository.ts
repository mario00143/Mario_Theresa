import type { CeremonyParticipant } from '@/types';
import { generateId } from '@/lib/id';
import { ceremonyParticipantsStore, ceremonySequenceItemsStore, runSheetItemsStore } from '../stores';

export type NewCeremonyParticipantInput = Omit<CeremonyParticipant, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addCeremonyParticipant(input: NewCeremonyParticipantInput): CeremonyParticipant {
  const timestamp = nowISO();
  const participant: CeremonyParticipant = { ...input, id: generateId('participant'), createdAt: timestamp, updatedAt: timestamp };
  ceremonyParticipantsStore.set((prev) => [...prev, participant]);
  return participant;
}

export function updateCeremonyParticipant(id: string, patch: Partial<Omit<CeremonyParticipant, 'id' | 'createdAt'>>): void {
  ceremonyParticipantsStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

/** Deletes a participant and removes it from any ceremony sequence item's or run-sheet item's participant list. */
export function deleteCeremonyParticipant(id: string): void {
  ceremonyParticipantsStore.set((prev) => prev.filter((p) => p.id !== id));
  ceremonySequenceItemsStore.set((prev) =>
    prev.map((s) => (s.participants.includes(id) ? { ...s, participants: s.participants.filter((p) => p !== id), updatedAt: nowISO() } : s)),
  );
  runSheetItemsStore.set((prev) =>
    prev.map((r) => (r.participantIds.includes(id) ? { ...r, participantIds: r.participantIds.filter((p) => p !== id), updatedAt: nowISO() } : r)),
  );
}

export function confirmCeremonyParticipant(id: string, confirmed: boolean): void {
  updateCeremonyParticipant(id, { confirmed });
}
