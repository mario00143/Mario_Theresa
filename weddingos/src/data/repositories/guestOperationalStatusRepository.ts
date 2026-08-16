import type { GuestOperationalState, GuestOperationalStatus } from '@/types';
import { generateId } from '@/lib/id';
import { guestOperationalStatusesStore } from '../stores';

export type NewGuestOperationalStatusInput = Omit<GuestOperationalStatus, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedAt'> & Partial<Pick<GuestOperationalStatus, 'lastUpdatedAt'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addGuestOperationalStatus(input: NewGuestOperationalStatusInput): GuestOperationalStatus {
  const timestamp = nowISO();
  const status: GuestOperationalStatus = {
    ...input,
    lastUpdatedAt: input.lastUpdatedAt ?? timestamp,
    id: generateId('guestop'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  guestOperationalStatusesStore.set((prev) => [...prev, status]);
  return status;
}

export function updateGuestOperationalStatus(id: string, patch: Partial<Omit<GuestOperationalStatus, 'id' | 'createdAt'>>): void {
  guestOperationalStatusesStore.set((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: nowISO() } : s)));
}

export function deleteGuestOperationalStatus(id: string): void {
  guestOperationalStatusesStore.set((prev) => prev.filter((s) => s.id !== id));
}

export function setGuestOperationalState(id: string, state: GuestOperationalState): void {
  const timestamp = nowISO();
  guestOperationalStatusesStore.set((prev) => prev.map((s) => (s.id === id ? { ...s, state, lastUpdatedAt: timestamp, updatedAt: timestamp } : s)));
}
