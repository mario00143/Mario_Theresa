import type { EmergencyContact } from '@/types';
import { generateId } from '@/lib/id';
import { emergencyContactsStore } from '../stores';

export type NewEmergencyContactInput = Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addEmergencyContact(input: NewEmergencyContactInput): EmergencyContact {
  const timestamp = nowISO();
  const contact: EmergencyContact = { ...input, id: generateId('emcontact'), createdAt: timestamp, updatedAt: timestamp };
  emergencyContactsStore.set((prev) => [...prev, contact]);
  return contact;
}

export function updateEmergencyContact(id: string, patch: Partial<Omit<EmergencyContact, 'id' | 'createdAt'>>): void {
  emergencyContactsStore.set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)));
}

export function deleteEmergencyContact(id: string): void {
  emergencyContactsStore.set((prev) => prev.filter((c) => c.id !== id));
}
