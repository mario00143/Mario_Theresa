import type { GuestEvent, RsvpResponse, RsvpStatus } from '@/types';
import { guestsStore } from '../stores';

function nowISO(): string {
  return new Date().toISOString();
}

function patchResponse(responses: RsvpResponse[], event: GuestEvent, patch: Partial<Omit<RsvpResponse, 'event'>>): RsvpResponse[] {
  let found = false;
  const next = responses.map((r) => {
    if (r.event !== event) return r;
    found = true;
    return { ...r, ...patch };
  });
  if (!found) next.push({ event, status: 'No Response', ...patch });
  return next;
}

/** Updates one guest's RSVP response for a single event (status, method, headcounts, notes, etc). */
export function updateGuestRsvp(guestId: string, event: GuestEvent, patch: Partial<Omit<RsvpResponse, 'event'>>): void {
  guestsStore.set((prev) =>
    prev.map((guest) =>
      guest.id === guestId
        ? { ...guest, rsvpResponses: patchResponse(guest.rsvpResponses, event, patch), updatedAt: nowISO() }
        : guest,
    ),
  );
}

export function setGuestRsvpStatus(guestId: string, event: GuestEvent, status: RsvpStatus): void {
  const respondedAt = status === 'Pending' || status === 'No Response' ? undefined : new Date().toISOString().slice(0, 10);
  updateGuestRsvp(guestId, event, { status, respondedAt });
}

/** Sets every member of a household to the same RSVP status for one event — a fast bulk-entry action. */
export function bulkSetHouseholdRsvpStatus(householdId: string, event: GuestEvent, status: RsvpStatus): void {
  const respondedAt = status === 'Pending' || status === 'No Response' ? undefined : new Date().toISOString().slice(0, 10);
  guestsStore.set((prev) =>
    prev.map((guest) => {
      if (guest.householdId !== householdId) return guest;
      if (!guest.invitedEvents.includes(event)) return guest;
      return { ...guest, rsvpResponses: patchResponse(guest.rsvpResponses, event, { status, respondedAt }), updatedAt: nowISO() };
    }),
  );
}

export function resetHouseholdRsvpToPending(householdId: string, event: GuestEvent): void {
  bulkSetHouseholdRsvpStatus(householdId, event, 'Pending');
}
