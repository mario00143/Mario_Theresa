import type { EmergencyResponseCard } from '@/types';
import { generateId } from '@/lib/id';
import { emergencyResponseCardsStore } from '../stores';

export type NewEmergencyResponseCardInput = Omit<EmergencyResponseCard, 'id' | 'createdAt' | 'updatedAt' | 'immediateActions'> &
  Partial<Pick<EmergencyResponseCard, 'immediateActions'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addEmergencyResponseCard(input: NewEmergencyResponseCardInput): EmergencyResponseCard {
  const timestamp = nowISO();
  const card: EmergencyResponseCard = { immediateActions: [], ...input, id: generateId('emcard'), createdAt: timestamp, updatedAt: timestamp };
  emergencyResponseCardsStore.set((prev) => [...prev, card]);
  return card;
}

export function updateEmergencyResponseCard(id: string, patch: Partial<Omit<EmergencyResponseCard, 'id' | 'createdAt'>>): void {
  emergencyResponseCardsStore.set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)));
}

export function deleteEmergencyResponseCard(id: string): void {
  emergencyResponseCardsStore.set((prev) => prev.filter((c) => c.id !== id));
}
