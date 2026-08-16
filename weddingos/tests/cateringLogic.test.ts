import { describe, expect, it } from 'vitest';
import type { CateringPlan, Guest, MenuItem } from '@/types';
import { computeCateringWarnings, computeSuggestedCateringCounts } from '@/utils/cateringLogic';

function guest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: `guest-${Math.random()}`,
    householdId: 'household-1',
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function plan(overrides: Partial<CateringPlan> = {}): CateringPlan {
  return {
    id: 'plan-1',
    event: 'Wedding',
    serviceStyle: 'Kerala Sadya Style',
    coupleMealReserved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function menuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'menu-1',
    cateringPlanId: 'plan-1',
    course: 'Main Course',
    name: 'Sadya rice',
    dietaryType: 'Vegetarian',
    liveCounter: false,
    approved: true,
    tastingStatus: 'Not Scheduled',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('suggested catering counts (section 15)', () => {
  it('only counts guests attending the specified event', () => {
    const guests = [guest({ rsvpResponses: [{ event: 'Wedding', status: 'Attending' }] }), guest({ rsvpResponses: [{ event: 'Engagement', status: 'Attending' }] })];
    const suggested = computeSuggestedCateringCounts(guests, 'Wedding');
    expect(suggested.confirmedAttendees).toBe(1);
  });

  it('breaks counts down by age category and dietary preference', () => {
    const guests = [
      guest({ ageCategory: 'Adult', dietaryPreference: 'Vegetarian' }),
      guest({ ageCategory: 'Child', dietaryPreference: 'Non-Vegetarian' }),
      guest({ ageCategory: 'Infant', dietaryPreference: 'Not Specified' }),
    ];
    const suggested = computeSuggestedCateringCounts(guests, 'Wedding');
    expect(suggested).toMatchObject({ confirmedAttendees: 3, adults: 1, children: 1, infants: 1, vegetarian: 1, nonVegetarian: 1, unspecifiedDiet: 1 });
  });

  it('counts guests with allergies separately', () => {
    const guests = [guest({ allergies: 'Nuts' }), guest()];
    expect(computeSuggestedCateringCounts(guests, 'Wedding').allergiesCount).toBe(1);
  });

  it('excludes guests who declined or have no response', () => {
    const guests = [guest({ rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] }), guest({ rsvpResponses: [] })];
    expect(computeSuggestedCateringCounts(guests, 'Wedding').confirmedAttendees).toBe(0);
  });
});

describe('catering plan warnings (section 15)', () => {
  const suggested = computeSuggestedCateringCounts([guest(), guest(), guest()], 'Wedding');

  it('flags a guaranteed count below confirmed RSVP attendance', () => {
    const warnings = computeCateringWarnings(plan({ guaranteedCount: 1 }), suggested, []);
    expect(warnings).toContain('Guaranteed count is below confirmed RSVP attendance.');
  });

  it('flags a significant gap between RSVP attendance and the guaranteed count', () => {
    const warnings = computeCateringWarnings(plan({ guaranteedCount: 10 }), suggested, []);
    expect(warnings).toContain('Significant gap between RSVP-confirmed attendance and the guaranteed count.');
  });

  it('does not flag a guaranteed count close to confirmed attendance', () => {
    const warnings = computeCateringWarnings(plan({ guaranteedCount: 3 }), suggested, []);
    expect(warnings).not.toContain('Guaranteed count is below confirmed RSVP attendance.');
    expect(warnings).not.toContain('Significant gap between RSVP-confirmed attendance and the guaranteed count.');
  });

  it('flags no guaranteed count set yet when attendance is confirmed', () => {
    const warnings = computeCateringWarnings(plan(), suggested, []);
    expect(warnings).toContain('No guaranteed count set yet.');
  });

  it('flags an overdue final count due date with no guaranteed count', () => {
    const warnings = computeCateringWarnings(plan({ finalCountDueDate: '2026-01-01' }), suggested, [], '2026-06-01');
    expect(warnings).toContain('Final count due date has passed with no guaranteed count recorded.');
  });

  it('flags guests with allergies and no documented allergen plan', () => {
    const guestsWithAllergy = computeSuggestedCateringCounts([guest({ allergies: 'Cashew' })], 'Wedding');
    const warnings = computeCateringWarnings(plan({ guaranteedCount: 1 }), guestsWithAllergy, [menuItem({ allergens: undefined })]);
    expect(warnings).toContain('Guests with allergies exist but no allergen plan is documented on the menu.');
  });

  it('does not flag allergies when the menu documents an allergen', () => {
    const guestsWithAllergy = computeSuggestedCateringCounts([guest({ allergies: 'Cashew' })], 'Wedding');
    const warnings = computeCateringWarnings(plan({ guaranteedCount: 1 }), guestsWithAllergy, [menuItem({ allergens: 'Contains cashew' })]);
    expect(warnings).not.toContain('Guests with allergies exist but no allergen plan is documented on the menu.');
  });

  it('flags vendor meals not planned when a vendor is linked', () => {
    const warnings = computeCateringWarnings(plan({ vendorId: 'vendor-1', guaranteedCount: 3 }), suggested, []);
    expect(warnings).toContain('Vendor meals not planned.');
  });

  it('flags couple meal not reserved', () => {
    const warnings = computeCateringWarnings(plan({ coupleMealReserved: false, guaranteedCount: 3 }), suggested, []);
    expect(warnings).toContain('Couple meal not reserved.');
  });

  it('flags unspecified dietary preferences', () => {
    const withUnspecified = computeSuggestedCateringCounts([guest({ dietaryPreference: 'Not Specified' })], 'Wedding');
    const warnings = computeCateringWarnings(plan({ guaranteedCount: 1 }), withUnspecified, []);
    expect(warnings).toContain('1 confirmed guest with unspecified dietary preference.');
  });
});
