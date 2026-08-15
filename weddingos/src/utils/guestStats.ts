import type { AgeCategory, DietaryPreference, Guest, GuestEvent, Household, InvitationStatus } from '@/types';
import { INVITATION_STATUSES } from '@/types';
import { getGuestRsvpForEvent, getGuestRsvpStatus, isGuestAttending } from './rsvpLogic';

/**
 * The Guest Overview cards (dashboard-style counts) are scoped to the
 * Wedding — the flagship event with the full guest list — to keep the
 * summary simple. Event-specific breakdowns live in the RSVP page and
 * Reports module.
 */
const OVERVIEW_EVENT: GuestEvent = 'Wedding';

export interface GuestOverviewStats {
  totalHouseholds: number;
  totalGuests: number;
  groomSideGuests: number;
  brideSideGuests: number;
  weddingInvitees: number;
  engagementInvitees: number;
  rsvpAttending: number;
  rsvpDeclined: number;
  rsvpPendingOrNoResponse: number;
  adultsAttending: number;
  childrenAttending: number;
  infantsAttending: number;
  vegetarianAttending: number;
  nonVegetarianAttending: number;
  accommodationRequested: number;
  pickupRequested: number;
  accessibilityAssistanceRequired: number;
}

export function computeGuestOverview(households: Household[], guests: Guest[]): GuestOverviewStats {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const sideOf = (guest: Guest) => householdById.get(guest.householdId)?.side;

  const weddingGuests = guests.filter((g) => g.invitedEvents.includes('Wedding'));
  const attendingWedding = weddingGuests.filter((g) => isGuestAttending(g, OVERVIEW_EVENT));
  const declinedWedding = weddingGuests.filter((g) => getGuestRsvpStatus(g, OVERVIEW_EVENT) === 'Declined');
  const pendingWedding = weddingGuests.filter((g) => {
    const status = getGuestRsvpStatus(g, OVERVIEW_EVENT);
    return status === 'Pending' || status === 'No Response';
  });

  return {
    totalHouseholds: households.length,
    totalGuests: guests.length,
    groomSideGuests: guests.filter((g) => sideOf(g) === 'Groom' || sideOf(g) === 'Both').length,
    brideSideGuests: guests.filter((g) => sideOf(g) === 'Bride' || sideOf(g) === 'Both').length,
    weddingInvitees: weddingGuests.length,
    engagementInvitees: guests.filter((g) => g.invitedEvents.includes('Engagement')).length,
    rsvpAttending: attendingWedding.length,
    rsvpDeclined: declinedWedding.length,
    rsvpPendingOrNoResponse: pendingWedding.length,
    adultsAttending: attendingWedding.filter((g) => g.ageCategory === 'Adult').length,
    childrenAttending: attendingWedding.filter((g) => g.ageCategory === 'Child').length,
    infantsAttending: attendingWedding.filter((g) => g.ageCategory === 'Infant').length,
    vegetarianAttending: attendingWedding.filter((g) => g.dietaryPreference === 'Vegetarian').length,
    nonVegetarianAttending: attendingWedding.filter((g) => g.dietaryPreference === 'Non-Vegetarian').length,
    accommodationRequested: attendingWedding.filter((g) => g.accommodationRequired).length,
    pickupRequested: attendingWedding.filter((g) => g.pickupRequired).length,
    accessibilityAssistanceRequired: guests.filter(
      (g) => Boolean(g.accessibilityRequirements) || g.elderlyAssistanceRequired || Boolean(g.infantRequirements),
    ).length,
  };
}

export interface InvitationReport {
  total: number;
  byStatus: Record<InvitationStatus, number>;
}

export function computeInvitationReport(households: Household[]): InvitationReport {
  const byStatus = Object.fromEntries(INVITATION_STATUSES.map((s) => [s, 0])) as Record<InvitationStatus, number>;
  for (const household of households) {
    byStatus[household.invitationStatus] += 1;
  }
  return { total: households.length, byStatus };
}

export interface RsvpReportRow {
  total: number;
  attending: number;
  declined: number;
  maybe: number;
  pending: number;
  noResponse: number;
}

function emptyRsvpRow(): RsvpReportRow {
  return { total: 0, attending: 0, declined: 0, maybe: 0, pending: 0, noResponse: 0 };
}

function tallyRsvpRow(row: RsvpReportRow, status: string): void {
  row.total += 1;
  if (status === 'Attending') row.attending += 1;
  else if (status === 'Declined') row.declined += 1;
  else if (status === 'Maybe') row.maybe += 1;
  else if (status === 'Pending') row.pending += 1;
  else row.noResponse += 1;
}

export interface RsvpReport {
  overall: RsvpReportRow;
  byEvent: Record<GuestEvent, RsvpReportRow>;
  bySide: { Groom: RsvpReportRow; Bride: RsvpReportRow; Both: RsvpReportRow };
}

export function computeRsvpReport(guests: Guest[], households: Household[]): RsvpReport {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const overall = emptyRsvpRow();
  const byEvent: Record<GuestEvent, RsvpReportRow> = { Engagement: emptyRsvpRow(), Wedding: emptyRsvpRow() };
  const bySide = { Groom: emptyRsvpRow(), Bride: emptyRsvpRow(), Both: emptyRsvpRow() };

  for (const guest of guests) {
    const side = householdById.get(guest.householdId)?.side;
    for (const event of guest.invitedEvents) {
      const status = getGuestRsvpStatus(guest, event);
      tallyRsvpRow(overall, status);
      tallyRsvpRow(byEvent[event], status);
      if (side) tallyRsvpRow(bySide[side], status);
    }
  }

  return { overall, byEvent, bySide };
}

export interface MealCounts {
  event: GuestEvent;
  adults: number;
  children: number;
  infants: number;
  byDiet: Record<DietaryPreference, number>;
}

export function computeMealCounts(guests: Guest[], event: GuestEvent): MealCounts {
  const attending = guests.filter((g) => g.invitedEvents.includes(event) && isGuestAttending(g, event));
  const byAge = (category: AgeCategory) => attending.filter((g) => g.ageCategory === category).length;

  const byDiet: Record<DietaryPreference, number> = {
    Vegetarian: 0,
    'Non-Vegetarian': 0,
    Vegan: 0,
    Jain: 0,
    Other: 0,
    'Not Specified': 0,
  };
  for (const guest of attending) {
    byDiet[guest.dietaryPreference] += 1;
  }

  return {
    event,
    adults: byAge('Adult'),
    children: byAge('Child'),
    infants: byAge('Infant'),
    byDiet,
  };
}

export interface AccommodationReportRow {
  guest: Guest;
  household: Household | undefined;
}

/** Confirmed-attending guests (any invited event) who require accommodation. */
export function computeAccommodationReport(guests: Guest[], households: Household[]): AccommodationReportRow[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  return guests
    .filter((g) => g.accommodationRequired && g.invitedEvents.some((event) => isGuestAttending(g, event)))
    .map((guest) => ({ guest, household: householdById.get(guest.householdId) }));
}

export interface PickupReportRow {
  guest: Guest;
  household: Household | undefined;
  travelDetailsStatus: 'Submitted' | 'Not Submitted';
}

/** Confirmed-attending guests (any invited event) who requested pickup. */
export function computePickupReport(guests: Guest[], households: Household[]): PickupReportRow[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  return guests
    .filter((g) => g.pickupRequired && g.invitedEvents.some((event) => isGuestAttending(g, event)))
    .map((guest) => {
      const submitted = guest.invitedEvents.some((event) => getGuestRsvpForEvent(guest, event)?.travelDetailsSubmitted);
      return { guest, household: householdById.get(guest.householdId), travelDetailsStatus: submitted ? 'Submitted' : 'Not Submitted' as const };
    });
}

export interface AccessibilityReportRow {
  guest: Guest;
  household: Household | undefined;
  reasons: string[];
}

export function computeAccessibilityReport(guests: Guest[], households: Household[]): AccessibilityReportRow[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  return guests
    .filter((g) => g.accessibilityRequirements || g.elderlyAssistanceRequired || g.infantRequirements || g.allergies)
    .map((guest) => {
      const reasons: string[] = [];
      if (guest.accessibilityRequirements) reasons.push(guest.accessibilityRequirements);
      if (guest.elderlyAssistanceRequired) reasons.push('Elderly assistance required');
      if (guest.infantRequirements) reasons.push(`Infant needs: ${guest.infantRequirements}`);
      if (guest.allergies) reasons.push(`Allergies: ${guest.allergies}`);
      return { guest, household: householdById.get(guest.householdId), reasons };
    });
}
