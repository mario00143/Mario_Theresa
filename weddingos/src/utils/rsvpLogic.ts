import type { Guest, GuestEvent, Household, HouseholdRsvpState, RsvpResponse, RsvpStatus } from '@/types';

export function getGuestRsvpForEvent(guest: Guest, event: GuestEvent): RsvpResponse | undefined {
  return guest.rsvpResponses.find((r) => r.event === event);
}

export function getGuestRsvpStatus(guest: Guest, event: GuestEvent): RsvpStatus {
  return getGuestRsvpForEvent(guest, event)?.status ?? 'No Response';
}

const UNRESOLVED_STATUSES: RsvpStatus[] = ['Pending', 'No Response'];

/** Guests belonging to a household who are actually invited to the given event. */
export function getHouseholdMembersForEvent(household: Household, guests: Guest[], event: GuestEvent): Guest[] {
  return guests.filter((g) => g.householdId === household.id && g.invitedEvents.includes(event));
}

/**
 * Rolls up a household's members' individual RSVP responses into a single
 * state for one event:
 * - Attending: every invited member responded Attending
 * - Declined: every invited member responded Declined
 * - Pending: no member has given a final response yet (all Pending/No Response)
 * - Partial: any other mix (including Maybe, or a mix of Attending/Declined/etc.)
 */
export function householdRsvpSummary(household: Household, guests: Guest[], event: GuestEvent): HouseholdRsvpState {
  const members = getHouseholdMembersForEvent(household, guests, event);
  if (members.length === 0) return 'Pending';

  const statuses = members.map((g) => getGuestRsvpStatus(g, event));
  const distinct = new Set(statuses);

  if (distinct.size === 1) {
    const only = statuses[0];
    if (only === 'Attending') return 'Attending';
    if (only === 'Declined') return 'Declined';
  }

  if (statuses.every((s) => UNRESOLVED_STATUSES.includes(s))) return 'Pending';

  return 'Partial';
}

/**
 * A single "primary" RSVP state for a household, used in list/table
 * contexts that can't show a per-event breakdown. Prefers the Wedding
 * event (the flagship event most households are invited to); falls back
 * to Engagement for households invited to that only.
 */
export function householdPrimaryRsvpState(household: Household, guests: Guest[]): HouseholdRsvpState {
  const event: GuestEvent = household.invitedEvents.includes('Wedding') ? 'Wedding' : 'Engagement';
  return householdRsvpSummary(household, guests, event);
}

export function isGuestAttending(guest: Guest, event: GuestEvent): boolean {
  return getGuestRsvpStatus(guest, event) === 'Attending';
}

/** True if the guest is Attending at least one of their invited events. */
export function isGuestAttendingAnyEvent(guest: Guest): boolean {
  return guest.invitedEvents.some((event) => isGuestAttending(guest, event));
}
