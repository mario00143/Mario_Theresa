import { describe, expect, it } from 'vitest';
import type { Guest, Household } from '@/types';
import { detectDataIssues } from '@/utils/guestDataQuality';

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

describe('guest data quality checks', () => {
  it('flags a household with no primary contact name', () => {
    const households = [makeHousehold({ primaryContactName: '' })];
    const issues = detectDataIssues(households, []);
    expect(issues.some((i) => i.category === 'missing-primary-contact')).toBe(true);
  });

  it('flags a household with neither phone nor email', () => {
    const households = [makeHousehold({ primaryPhone: '', email: undefined })];
    const issues = detectDataIssues(households, []);
    expect(issues.some((i) => i.category === 'missing-contact-method')).toBe(true);
  });

  it('does not flag a household that has an email but no phone', () => {
    const households = [makeHousehold({ primaryPhone: '', email: 'someone@example.com' })];
    const issues = detectDataIssues(households, []);
    expect(issues.some((i) => i.category === 'missing-contact-method')).toBe(false);
  });

  it('flags a guest with no matching household', () => {
    const guests = [makeGuest({ householdId: 'nonexistent' })];
    const issues = detectDataIssues([], guests);
    expect(issues.some((i) => i.category === 'orphaned-guest')).toBe(true);
  });

  it('flags a guest invited to an event with no RSVP status recorded', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest({ invitedEvents: ['Wedding', 'Engagement'], rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'missing-rsvp-status')).toBe(true);
  });

  it('flags an Attending guest with dietary preference not specified', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest({ dietaryPreference: 'Not Specified', rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'attending-missing-diet')).toBe(true);
  });

  it('does not flag dietary preference when the guest is not attending', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest({ dietaryPreference: 'Not Specified', rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'attending-missing-diet')).toBe(false);
  });

  it('flags accommodation required when the guest has not RSVP\'d Attending anywhere', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest({ accommodationRequired: true, rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'accommodation-not-attending')).toBe(true);
  });

  it('does not flag accommodation when the guest is confirmed attending', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest({ accommodationRequired: true, rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'accommodation-not-attending')).toBe(false);
  });

  it('flags pickup required with travel details not submitted', () => {
    const households = [makeHousehold()];
    const guests = [
      makeGuest({ pickupRequired: true, rsvpResponses: [{ event: 'Wedding', status: 'Attending', travelDetailsSubmitted: false }] }),
    ];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'pickup-missing-travel-details')).toBe(true);
  });

  it('does not flag pickup when travel details were submitted', () => {
    const households = [makeHousehold()];
    const guests = [
      makeGuest({ pickupRequired: true, rsvpResponses: [{ event: 'Wedding', status: 'Attending', travelDetailsSubmitted: true }] }),
    ];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'pickup-missing-travel-details')).toBe(false);
  });

  it('flags duplicate phone numbers across households', () => {
    const households = [makeHousehold({ id: 'h1', primaryPhone: '9111111111' }), makeHousehold({ id: 'h2', primaryPhone: '9111111111' })];
    const issues = detectDataIssues(households, []);
    expect(issues.filter((i) => i.category === 'duplicate-phone')).toHaveLength(2);
  });

  it('flags duplicate emails across households', () => {
    const households = [
      makeHousehold({ id: 'h1', email: 'shared@example.com' }),
      makeHousehold({ id: 'h2', email: 'shared@example.com' }),
    ];
    const issues = detectDataIssues(households, []);
    expect(issues.filter((i) => i.category === 'duplicate-email')).toHaveLength(2);
  });

  it('flags a household marked Complete with an unresolved member RSVP', () => {
    const households = [makeHousehold({ invitationStatus: 'Complete' })];
    const guests = [makeGuest({ rsvpResponses: [{ event: 'Wedding', status: 'Pending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'complete-but-incomplete-rsvp')).toBe(true);
  });

  it('does not flag a Complete household whose members are all resolved', () => {
    const households = [makeHousehold({ invitationStatus: 'Complete' })];
    const guests = [makeGuest({ rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] })];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'complete-but-incomplete-rsvp')).toBe(false);
  });

  it('flags a possible duplicate guest by name similarity', () => {
    const households = [makeHousehold()];
    const guests = [
      makeGuest({ id: 'g1', fullName: 'Alex Thomas' }),
      makeGuest({ id: 'g2', fullName: 'Alex Thomass' }),
    ];
    const issues = detectDataIssues(households, guests);
    expect(issues.some((i) => i.category === 'possible-duplicate-guest')).toBe(true);
  });
});
