import { beforeEach, describe, expect, it } from 'vitest';
import { addHousehold, countGuestsForHousehold, deleteHousehold, updateHousehold } from '@/data/repositories/householdRepository';
import { addGuest } from '@/data/repositories/guestRepository';
import { resetToDemoData, guestsStore, householdsStore } from '@/data/stores';
import { findSimilarHouseholds } from '@/utils/duplicateDetection';

describe('household repository', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('creates a household with sensible defaults', () => {
    const household = addHousehold({
      householdName: 'Test Family',
      primaryContactName: 'Test Person',
      primaryPhone: '9000000000',
      side: 'Groom',
      relationshipCategory: 'Friend',
      city: 'Hyderabad',
      country: 'India',
      invitationPriority: 'Standard',
      invitationStatus: 'Not Prepared',
    });

    expect(household.id).toBeTruthy();
    expect(household.invitedEvents).toEqual([]);
    expect(household.invitationMethod).toEqual([]);
    expect(householdsStore.get().some((h) => h.id === household.id)).toBe(true);
  });

  it('edits a household in place, updating updatedAt', () => {
    const household = addHousehold({
      householdName: 'Test Family',
      primaryContactName: 'Test Person',
      primaryPhone: '9000000000',
      side: 'Groom',
      relationshipCategory: 'Friend',
      city: 'Hyderabad',
      country: 'India',
      invitationPriority: 'Standard',
      invitationStatus: 'Not Prepared',
    });

    updateHousehold(household.id, { city: 'Bengaluru' });

    const updated = householdsStore.get().find((h) => h.id === household.id);
    expect(updated?.city).toBe('Bengaluru');
    expect(updated?.updatedAt >= household.createdAt).toBe(true);
  });

  it('deletes a household with no members cleanly', () => {
    const household = addHousehold({
      householdName: 'Empty Family',
      primaryContactName: 'Nobody',
      primaryPhone: '9000000001',
      side: 'Bride',
      relationshipCategory: 'Friend',
      city: 'Chennai',
      country: 'India',
      invitationPriority: 'Optional',
      invitationStatus: 'Not Prepared',
    });

    deleteHousehold(household.id);
    expect(householdsStore.get().some((h) => h.id === household.id)).toBe(false);
  });

  it('cascades deletion: deleting a household removes its guests too', () => {
    const household = addHousehold({
      householdName: 'Cascade Family',
      primaryContactName: 'Someone',
      primaryPhone: '9000000002',
      side: 'Groom',
      relationshipCategory: 'Friend',
      city: 'Mumbai',
      country: 'India',
      invitationPriority: 'Standard',
      invitationStatus: 'Not Prepared',
    });
    const guestA = addGuest({
      householdId: household.id,
      fullName: 'Cascade Guest A',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });
    const guestB = addGuest({
      householdId: household.id,
      fullName: 'Cascade Guest B',
      ageCategory: 'Adult',
      dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false,
      accommodationRequired: false,
      travelDetailsRequired: false,
      pickupRequired: false,
      plusOneStatus: 'Not Applicable',
    });

    expect(countGuestsForHousehold(household.id)).toBe(2);

    deleteHousehold(household.id);

    expect(householdsStore.get().some((h) => h.id === household.id)).toBe(false);
    const remainingIds = guestsStore.get().map((g) => g.id);
    expect(remainingIds).not.toContain(guestA.id);
    expect(remainingIds).not.toContain(guestB.id);
  });

  it('warns on a duplicate primary phone', () => {
    const existing = householdsStore.get()[0];
    const warnings = findSimilarHouseholds(
      { householdName: 'Brand New Household', primaryPhone: existing.primaryPhone },
      householdsStore.get(),
    );
    expect(warnings.some((w) => w.reason.includes('Primary phone matches'))).toBe(true);
  });

  it('warns on a duplicate email', () => {
    const existingWithEmail = householdsStore.get().find((h) => h.email);
    expect(existingWithEmail).toBeTruthy();
    const warnings = findSimilarHouseholds(
      { householdName: 'Another New Household', email: existingWithEmail!.email },
      householdsStore.get(),
    );
    expect(warnings.some((w) => w.reason.includes('Email matches'))).toBe(true);
  });

  it('warns on a very similar household name', () => {
    const warnings = findSimilarHouseholds({ householdName: 'Vargheese Family' }, householdsStore.get());
    expect(warnings.some((w) => w.reason.includes('very similar'))).toBe(true);
  });

  it('does not warn about an unrelated new household', () => {
    const warnings = findSimilarHouseholds(
      { householdName: 'Completely Unrelated Household Xyzzy', primaryPhone: '000000', email: 'nobody@nowhere.test' },
      householdsStore.get(),
    );
    expect(warnings).toHaveLength(0);
  });

  it('excludes the household itself from duplicate checks when editing', () => {
    const household = householdsStore.get()[0];
    const warnings = findSimilarHouseholds(household, householdsStore.get(), household.id);
    expect(warnings).toHaveLength(0);
  });
});
