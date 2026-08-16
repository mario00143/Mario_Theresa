import type { Guest, GuestEvent, RsvpResponse } from '@/types';
import { generateId } from '@/lib/id';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import { attireProfilesStore, ceremonyParticipantsStore, dutyAssignmentsStore, giftPlansStore, guestOperationalStatusesStore, guestsStore, liveIssuesStore } from '../stores';

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

/** Deletes a guest and un-links (not deletes) any Phase 5 records that optionally referenced it. */
export function deleteGuest(id: string): void {
  const guest = guestsStore.get().find((g) => g.id === id);
  guestsStore.set((prev) => prev.filter((guest) => guest.id !== id));
  logAuditAction({ action: 'guest.delete', entityType: 'Guest', entityId: id, summary: `Deleted guest "${guest?.fullName ?? id}"` });
  ceremonyParticipantsStore.set((prev) =>
    prev.map((p) => (p.linkedGuestId === id ? { ...p, linkedGuestId: undefined, updatedAt: nowISO() } : p)),
  );
  attireProfilesStore.set((prev) =>
    prev.map((p) => (p.linkedGuestId === id ? { ...p, linkedGuestId: undefined, updatedAt: nowISO() } : p)),
  );
  giftPlansStore.set((prev) => prev.map((p) => (p.linkedGuestId === id ? { ...p, linkedGuestId: undefined, updatedAt: nowISO() } : p)));

  // Phase 6 wedding-day records — same un-link-not-delete treatment, except the guest's own operational-status row, which is a 1:1 extension and cascades.
  dutyAssignmentsStore.set((prev) => prev.map((d) => (d.linkedGuestId === id ? { ...d, linkedGuestId: undefined, updatedAt: nowISO() } : d)));
  liveIssuesStore.set((prev) => prev.map((i) => (i.relatedGuestId === id ? { ...i, relatedGuestId: undefined, updatedAt: nowISO() } : i)));
  guestOperationalStatusesStore.set((prev) => prev.filter((s) => s.guestId !== id));
}

export function moveGuestToHousehold(guestId: string, newHouseholdId: string): void {
  guestsStore.set((prev) =>
    prev.map((guest) => (guest.id === guestId ? { ...guest, householdId: newHouseholdId, updatedAt: nowISO() } : guest)),
  );
}
