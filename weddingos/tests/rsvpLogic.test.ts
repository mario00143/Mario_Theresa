import { describe, expect, it } from 'vitest';
import type { Guest, Household } from '@/types';
import { getGuestRsvpStatus, householdPrimaryRsvpState, householdRsvpSummary, isGuestAttending } from '@/utils/rsvpLogic';

function makeHousehold(overrides: Partial<Household> = {}): Household {
  return {
    id: 'household-1',
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
    householdId: 'household-1',
    fullName: 'Test Guest',
    ageCategory: 'Adult',
    invitedEvents: ['Wedding'],
    rsvpResponses: [{ event: 'Wedding', status: 'No Response' }],
    dietaryPreference: 'Not Specified',
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

describe('individual guest RSVP', () => {
  it('reads a guest RSVP status for an event', () => {
    const guest = makeGuest({ rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] });
    expect(getGuestRsvpStatus(guest, 'Wedding')).toBe('Attending');
    expect(isGuestAttending(guest, 'Wedding')).toBe(true);
  });

  it('defaults to "No Response" when there is no response entry for the event', () => {
    const guest = makeGuest({ invitedEvents: ['Wedding', 'Engagement'], rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] });
    expect(getGuestRsvpStatus(guest, 'Engagement')).toBe('No Response');
  });
});

describe('household RSVP aggregation', () => {
  const household = makeHousehold();

  it('is Attending when every invited member responded Attending', () => {
    const guests = [
      makeGuest({ id: 'a', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'b', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Attending');
  });

  it('is Declined when every invited member responded Declined', () => {
    const guests = [
      makeGuest({ id: 'a', rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] }),
      makeGuest({ id: 'b', rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Declined');
  });

  it('is Pending when no member has given a final response yet', () => {
    const guests = [
      makeGuest({ id: 'a', rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] }),
      makeGuest({ id: 'b', rsvpResponses: [{ event: 'Wedding', status: 'No Response' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Pending');
  });

  it('is Partial when responses are a mix of Attending/Declined', () => {
    const guests = [
      makeGuest({ id: 'a', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'b', rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Partial');
  });

  it('is Partial when responses mix a final answer with Maybe', () => {
    const guests = [
      makeGuest({ id: 'a', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'b', rsvpResponses: [{ event: 'Wedding', status: 'Maybe' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Partial');
  });

  it('is Partial when one member is Attending and another is still Pending', () => {
    const guests = [
      makeGuest({ id: 'a', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'b', rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Partial');
  });

  it('ignores members not invited to the event in question', () => {
    const guests = [
      makeGuest({ id: 'a', invitedEvents: ['Wedding'], rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }),
      makeGuest({ id: 'b', invitedEvents: ['Engagement'], rsvpResponses: [{ event: 'Engagement', status: 'Declined' }] }),
    ];
    expect(householdRsvpSummary(household, guests, 'Wedding')).toBe('Attending');
  });

  it('returns Pending for a household with no members invited to the event', () => {
    expect(householdRsvpSummary(household, [], 'Wedding')).toBe('Pending');
  });

  it('computes a primary state preferring Wedding over Engagement', () => {
    const both = makeHousehold({ invitedEvents: ['Engagement', 'Wedding'] });
    const guests = [
      makeGuest({ id: 'a', invitedEvents: ['Engagement', 'Wedding'], rsvpResponses: [
        { event: 'Engagement', status: 'Declined' },
        { event: 'Wedding', status: 'Attending' },
      ] }),
    ];
    expect(householdPrimaryRsvpState(both, guests)).toBe('Attending');
  });
});
