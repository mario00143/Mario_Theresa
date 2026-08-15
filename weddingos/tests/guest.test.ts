import { beforeEach, describe, expect, it } from 'vitest';
import { addGuest, deleteGuest, moveGuestToHousehold, updateGuest } from '@/data/repositories/guestRepository';
import { addHousehold } from '@/data/repositories/householdRepository';
import { guestsStore, householdsStore, resetToDemoData } from '@/data/stores';
import { findSimilarGuests } from '@/utils/duplicateDetection';

describe('guest repository', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  function makeHousehold(name: string) {
    return addHousehold({
      householdName: name,
      primaryContactName: 'Contact',
      primaryPhone: '9999999999',
      side: 'Groom',
      relationshipCategory: 'Friend',
      city: 'Hyderabad',
      country: 'India',
      invitationPriority: 'Standard',
      invitationStatus: 'Not Prepared',
    });
  }

  it('creates a guest and initializes an RSVP response for each invited event', () => {
    const household = makeHousehold('New Household');
    const guest = addGuest({
      householdId: household.id,
      fullName: 'New Guest',
      ageCategory: 'Adult',
      invitedEvents: ['Wedding', 'Engagement'],
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    expect(guest.rsvpResponses).toHaveLength(2);
    expect(guest.rsvpResponses.every((r) => r.status === 'No Response')).toBe(true);
  });

  it('edits a guest field', () => {
    const household = makeHousehold('Edit Household');
    const guest = addGuest({
      householdId: household.id,
      fullName: 'Edit Guest',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    updateGuest(guest.id, { dietaryPreference: 'Vegan' });
    expect(guestsStore.get().find((g) => g.id === guest.id)?.dietaryPreference).toBe('Vegan');
  });

  it('syncs rsvpResponses when invitedEvents changes', () => {
    const household = makeHousehold('Sync Household');
    const guest = addGuest({
      householdId: household.id,
      fullName: 'Sync Guest',
      ageCategory: 'Adult',
      invitedEvents: ['Wedding'],
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    updateGuest(guest.id, { invitedEvents: ['Wedding', 'Engagement'] });
    const updated = guestsStore.get().find((g) => g.id === guest.id)!;
    expect(updated.rsvpResponses.map((r) => r.event).sort()).toEqual(['Engagement', 'Wedding']);

    updateGuest(guest.id, { invitedEvents: ['Engagement'] });
    const narrowed = guestsStore.get().find((g) => g.id === guest.id)!;
    expect(narrowed.rsvpResponses.map((r) => r.event)).toEqual(['Engagement']);
  });

  it('moves a guest to another household', () => {
    const householdA = makeHousehold('Household A');
    const householdB = makeHousehold('Household B');
    const guest = addGuest({
      householdId: householdA.id,
      fullName: 'Movable Guest',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    moveGuestToHousehold(guest.id, householdB.id);
    expect(guestsStore.get().find((g) => g.id === guest.id)?.householdId).toBe(householdB.id);
  });

  it('deletes a guest without touching its household or other guests', () => {
    const household = makeHousehold('Deletable Household');
    const guest = addGuest({
      householdId: household.id,
      fullName: 'Deletable Guest',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    deleteGuest(guest.id);
    expect(guestsStore.get().some((g) => g.id === guest.id)).toBe(false);
    expect(householdsStore.get().some((h) => h.id === household.id)).toBe(true);
  });

  it('warns when a new guest has a very similar name to an existing one', () => {
    const existing = guestsStore.get()[0];
    const warnings = findSimilarGuests({ fullName: existing.fullName, householdId: existing.householdId }, guestsStore.get());
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('warns when the exact same full name already exists within the same household', () => {
    const household = makeHousehold('Duplicate Name Household');
    const first = addGuest({
      householdId: household.id,
      fullName: 'Same Name Guest',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    const warnings = findSimilarGuests({ fullName: 'Same Name Guest', householdId: household.id }, guestsStore.get());
    expect(warnings.some((w) => w.matchId === first.id && w.reason.includes('already exists in this household'))).toBe(true);
  });

  it('warns on a duplicate guest phone number', () => {
    const household = makeHousehold('Phone Household');
    const first = addGuest({
      householdId: household.id,
      fullName: 'Phone Owner',
      phone: '9123456789',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    const warnings = findSimilarGuests({ fullName: 'Different Name', phone: '9123456789', householdId: household.id }, guestsStore.get());
    expect(warnings.some((w) => w.matchId === first.id && w.reason.includes('Phone matches'))).toBe(true);
  });
});
