import { describe, expect, it } from 'vitest';
import type { Guest, Household } from '@/types';
import {
  computeAccessibilityReport,
  computeAccommodationReport,
  computeGuestOverview,
  computeInvitationReport,
  computeMealCounts,
  computePickupReport,
  computeRsvpReport,
} from '@/utils/guestStats';

function makeHousehold(overrides: Partial<Household> = {}): Household {
  return {
    id: overrides.id ?? 'household-1',
    householdName: 'Test Family',
    primaryContactName: 'Test Contact',
    primaryPhone: '9000000000',
    side: 'Groom',
    relationshipCategory: 'Friend',
    city: 'Hyderabad',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: [],
    invitationStatus: 'Sent',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: overrides.id ?? 'guest-1',
    householdId: overrides.householdId ?? 'household-1',
    fullName: 'Test Guest',
    ageCategory: 'Adult',
    invitedEvents: ['Wedding'],
    rsvpResponses: [{ event: 'Wedding', status: 'Attending' }],
    dietaryPreference: 'Vegetarian',
    elderlyAssistanceRequired: false,
    accommodationRequired: false,
    travelDetailsRequired: false,
    pickupRequired: false,
    plusOneStatus: 'Not Applicable',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('guest overview stats', () => {
  it('counts total guests, side breakdowns and RSVP tallies', () => {
    const households = [makeHousehold({ id: 'h1', side: 'Groom' }), makeHousehold({ id: 'h2', side: 'Bride' })];
    const guests = [
      makeGuest({ id: 'g1', householdId: 'h1', ageCategory: 'Adult', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g2', householdId: 'h1', ageCategory: 'Child', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g3', householdId: 'h2', ageCategory: 'Infant', rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] }),
      makeGuest({ id: 'g4', householdId: 'h2', ageCategory: 'Adult', rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] }),
    ];

    const stats = computeGuestOverview(households, guests);
    expect(stats.totalGuests).toBe(4);
    expect(stats.groomSideGuests).toBe(2);
    expect(stats.brideSideGuests).toBe(2);
    expect(stats.rsvpAttending).toBe(2);
    expect(stats.rsvpDeclined).toBe(1);
    expect(stats.rsvpPendingOrNoResponse).toBe(1);
    expect(stats.adultsAttending).toBe(1);
    expect(stats.childrenAttending).toBe(1);
    expect(stats.infantsAttending).toBe(0);
  });

  it('counts a "Both"-side household toward both groom-side and bride-side totals', () => {
    const households = [makeHousehold({ id: 'h1', side: 'Both' })];
    const guests = [makeGuest({ id: 'g1', householdId: 'h1' })];
    const stats = computeGuestOverview(households, guests);
    expect(stats.groomSideGuests).toBe(1);
    expect(stats.brideSideGuests).toBe(1);
  });
});

describe('invitation report', () => {
  it('tallies households by invitation status', () => {
    const households = [
      makeHousehold({ id: 'h1', invitationStatus: 'Not Prepared' }),
      makeHousehold({ id: 'h2', invitationStatus: 'Sent' }),
      makeHousehold({ id: 'h3', invitationStatus: 'Sent' }),
      makeHousehold({ id: 'h4', invitationStatus: 'Complete' }),
    ];
    const report = computeInvitationReport(households);
    expect(report.total).toBe(4);
    expect(report.byStatus.Sent).toBe(2);
    expect(report.byStatus['Not Prepared']).toBe(1);
    expect(report.byStatus.Complete).toBe(1);
  });
});

describe('RSVP report', () => {
  it('breaks down responses by event and by side', () => {
    const households = [makeHousehold({ id: 'h1', side: 'Groom' }), makeHousehold({ id: 'h2', side: 'Bride' })];
    const guests = [
      makeGuest({ id: 'g1', householdId: 'h1', invitedEvents: ['Wedding'], rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g2', householdId: 'h2', invitedEvents: ['Wedding', 'Engagement'], rsvpResponses: [
        { event: 'Wedding', status: 'Declined' },
        { event: 'Engagement', status: 'Attending' },
      ] }),
    ];
    const report = computeRsvpReport(guests, households);
    expect(report.overall.total).toBe(3);
    expect(report.byEvent.Wedding.total).toBe(2);
    expect(report.byEvent.Engagement.total).toBe(1);
    expect(report.bySide.Groom.attending).toBe(1);
    expect(report.bySide.Bride.declined).toBe(1);
  });
});

describe('meal counts', () => {
  it('counts confirmed attendees by age and dietary preference for one event', () => {
    const guests = [
      makeGuest({ id: 'g1', ageCategory: 'Adult', dietaryPreference: 'Vegetarian', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g2', ageCategory: 'Adult', dietaryPreference: 'Non-Vegetarian', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g3', ageCategory: 'Child', dietaryPreference: 'Vegetarian', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g4', ageCategory: 'Adult', dietaryPreference: 'Vegan', rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] }),
    ];
    const counts = computeMealCounts(guests, 'Wedding');
    expect(counts.adults).toBe(2);
    expect(counts.children).toBe(1);
    expect(counts.byDiet.Vegetarian).toBe(2);
    expect(counts.byDiet['Non-Vegetarian']).toBe(1);
    expect(counts.byDiet.Vegan).toBe(0); // declined guest excluded
  });
});

describe('accommodation report', () => {
  it('includes only confirmed-attending guests who require accommodation', () => {
    const households = [makeHousehold({ id: 'h1' })];
    const guests = [
      makeGuest({ id: 'g1', householdId: 'h1', accommodationRequired: true, rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'g2', householdId: 'h1', accommodationRequired: true, rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] }),
      makeGuest({ id: 'g3', householdId: 'h1', accommodationRequired: false, rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
    ];
    const rows = computeAccommodationReport(guests, households);
    expect(rows.map((r) => r.guest.id)).toEqual(['g1']);
  });
});

describe('pickup report', () => {
  it('flags travel details status per confirmed-attending guest requesting pickup', () => {
    const households = [makeHousehold({ id: 'h1' })];
    const guests = [
      makeGuest({
        id: 'g1',
        householdId: 'h1',
        pickupRequired: true,
        rsvpResponses: [{ event: 'Wedding', status: 'Attending', travelDetailsSubmitted: true }],
      }),
      makeGuest({
        id: 'g2',
        householdId: 'h1',
        pickupRequired: true,
        rsvpResponses: [{ event: 'Wedding', status: 'Attending', travelDetailsSubmitted: false }],
      }),
    ];
    const rows = computePickupReport(guests, households);
    expect(rows.find((r) => r.guest.id === 'g1')?.travelDetailsStatus).toBe('Submitted');
    expect(rows.find((r) => r.guest.id === 'g2')?.travelDetailsStatus).toBe('Not Submitted');
  });
});

describe('accessibility report', () => {
  it('surfaces guests with accessibility, elderly, infant, or allergy needs', () => {
    const households = [makeHousehold({ id: 'h1' })];
    const guests = [
      makeGuest({ id: 'g1', householdId: 'h1', accessibilityRequirements: 'Wheelchair access' }),
      makeGuest({ id: 'g2', householdId: 'h1', elderlyAssistanceRequired: true }),
      makeGuest({ id: 'g3', householdId: 'h1', allergies: 'Peanuts' }),
      makeGuest({ id: 'g4', householdId: 'h1' }),
    ];
    const rows = computeAccessibilityReport(guests, households);
    expect(rows.map((r) => r.guest.id).sort()).toEqual(['g1', 'g2', 'g3']);
  });
});
