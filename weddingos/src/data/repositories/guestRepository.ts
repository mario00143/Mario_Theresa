import type { Guest, GuestEvent, RsvpResponse } from '@/types';
import { generateId } from '@/lib/id';
import { guestsStore } from '../stores';

export type NewGuestInput = Omit<Guest, 'id' | 'createdAt' | 'updatedAt' | 'invitedEvents' | 'rsvpResponses'> &
  Partial<Pick<Guest, 'invitedEvents' | 'rsvpResponses'>>;

function nowISO(): string {
  return new Date().toISOString();
}

function defaultRsvpResponse(event: GuestEvent): RsvpResponse {
  return { event, status: 'No Response' };
}

/** Keeps rsvpResponses in sync with invitedEvents: adds defaults for newly invited events, drops responses for events no longer invited. */
function syncRsvpResponses(invitedEvents: GuestEvent[], existing: RsvpResponse[]): RsvpResponse[] {
  return invitedEvents.map((event) => existing.find((r) => r.event === event) ?? defaultRsvpResponse(event));
}

export function addGuest(input: NewGuestInput): Guest {
  const timestamp = nowISO();
  const invitedEvents = input.invitedEvents ?? [];
  const guest: Guest = {
    ...input,
    id: generateId('guest'),
    invitedEvents,
    rsvpResponses: syncRsvpResponses(invitedEvents, input.rsvpResponses ?? []),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  guestsStore.set((prev) => [...prev, guest]);
  return guest;
}

export function updateGuest(id: string, patch: Partial<Omit<Guest, 'id' | 'createdAt'>>): void {
  guestsStore.set((prev) =>
    prev.map((guest) => {
      if (guest.id !== id) return guest;
      const next = { ...guest, ...patch };
      if (patch.invitedEvents) {
        next.rsvpResponses = syncRsvpResponses(patch.invitedEvents, patch.rsvpResponses ?? guest.rsvpResponses);
      }
      return { ...next, updatedAt: nowISO() };
    }),
  );
}

export function deleteGuest(id: string): void {
  guestsStore.set((prev) => prev.filter((guest) => guest.id !== id));
}

export function moveGuestToHousehold(guestId: string, newHouseholdId: string): void {
  guestsStore.set((prev) =>
    prev.map((guest) => (guest.id === guestId ? { ...guest, householdId: newHouseholdId, updatedAt: nowISO() } : guest)),
  );
}
