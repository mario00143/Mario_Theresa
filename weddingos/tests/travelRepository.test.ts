import { beforeEach, describe, expect, it } from 'vitest';
import { addTravelSegment, deleteTravelSegment, duplicateTravelSegment, updateTravelSegment } from '@/data/repositories/travelRepository';
import { resetToDemoData, travelSegmentsStore } from '@/data/stores';
import { validateTravelSegment } from '@/utils/travelLogic';
import { findGuestsWithMissingTravel } from '@/utils/logisticsStats';
import type { Guest, Household, TravelSegment } from '@/types';

function makeSegment(overrides: Partial<TravelSegment> = {}): TravelSegment {
  return {
    id: overrides.id ?? 'travel-1',
    guestId: overrides.guestId ?? 'guest-1',
    householdId: overrides.householdId ?? 'household-1',
    event: 'Wedding',
    direction: 'Arrival',
    travelMode: 'Flight',
    origin: 'Kochi',
    destination: 'RGIA (Hyderabad Airport)',
    bookingStatus: 'Not Booked',
    ticketConfirmed: false,
    pickupRequired: false,
    dropRequired: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('travel repository CRUD', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('creates a travel segment with sensible defaults', () => {
    const segment = addTravelSegment({
      guestId: 'guest-1',
      householdId: 'household-1',
      event: 'Wedding',
      direction: 'Arrival',
      travelMode: 'Flight',
      origin: 'Kochi',
      destination: 'RGIA (Hyderabad Airport)',
      bookingStatus: 'Not Booked',
      ticketConfirmed: false,
      pickupRequired: false,
      dropRequired: false,
    });

    expect(segment.id).toBeTruthy();
    expect(travelSegmentsStore.get().some((s) => s.id === segment.id)).toBe(true);
  });

  it('edits a travel segment in place, updating updatedAt', () => {
    const segment = addTravelSegment({
      guestId: 'guest-1',
      householdId: 'household-1',
      event: 'Wedding',
      direction: 'Arrival',
      travelMode: 'Flight',
      origin: 'Kochi',
      destination: 'RGIA (Hyderabad Airport)',
      bookingStatus: 'Not Booked',
      ticketConfirmed: false,
      pickupRequired: false,
      dropRequired: false,
    });

    updateTravelSegment(segment.id, { bookingStatus: 'Confirmed', bookingReference: 'ABC-123' });

    const updated = travelSegmentsStore.get().find((s) => s.id === segment.id);
    expect(updated?.bookingStatus).toBe('Confirmed');
    expect(updated?.bookingReference).toBe('ABC-123');
    expect(updated?.updatedAt >= segment.createdAt).toBe(true);
  });

  it('deletes a travel segment', () => {
    const segment = addTravelSegment({
      guestId: 'guest-1',
      householdId: 'household-1',
      event: 'Wedding',
      direction: 'Arrival',
      travelMode: 'Flight',
      origin: 'Kochi',
      destination: 'RGIA (Hyderabad Airport)',
      bookingStatus: 'Not Booked',
      ticketConfirmed: false,
      pickupRequired: false,
      dropRequired: false,
    });

    deleteTravelSegment(segment.id);
    expect(travelSegmentsStore.get().some((s) => s.id === segment.id)).toBe(false);
  });

  it('duplicates a segment and resets its booking state', () => {
    const segment = addTravelSegment({
      guestId: 'guest-1',
      householdId: 'household-1',
      event: 'Wedding',
      direction: 'Arrival',
      travelMode: 'Flight',
      origin: 'Kochi',
      destination: 'RGIA (Hyderabad Airport)',
      bookingReference: 'REF-1',
      bookingStatus: 'Confirmed',
      ticketConfirmed: true,
      pickupRequired: true,
      dropRequired: false,
    });

    const duplicate = duplicateTravelSegment(segment.id);

    expect(duplicate).toBeTruthy();
    expect(duplicate!.id).not.toBe(segment.id);
    expect(duplicate!.bookingReference).toBeUndefined();
    expect(duplicate!.ticketConfirmed).toBe(false);
    expect(duplicate!.bookingStatus).toBe('Not Booked');
    expect(duplicate!.origin).toBe(segment.origin);
    expect(travelSegmentsStore.get().some((s) => s.id === duplicate!.id)).toBe(true);
  });

  it('returns null when duplicating a segment that does not exist', () => {
    expect(duplicateTravelSegment('does-not-exist')).toBeNull();
  });
});

describe('travel segment validation warnings', () => {
  it('warns when arrival date is set but arrival time is missing', () => {
    const warnings = validateTravelSegment(makeSegment({ arrivalDate: '2027-01-28' }));
    expect(warnings.some((w) => w.field === 'arrivalTime')).toBe(true);
  });

  it('does not warn when arrival date and time are both set', () => {
    const warnings = validateTravelSegment(makeSegment({ arrivalDate: '2027-01-28', arrivalTime: '14:10' }));
    expect(warnings.some((w) => w.field === 'arrivalTime')).toBe(false);
  });

  it('warns when pickup is required but the arrival location is blank', () => {
    const warnings = validateTravelSegment(makeSegment({ pickupRequired: true, destination: '' }));
    expect(warnings.some((w) => w.field === 'destination')).toBe(true);
  });

  it('warns when drop is required but the departure location is blank', () => {
    const warnings = validateTravelSegment(makeSegment({ direction: 'Departure', dropRequired: true, origin: '' }));
    expect(warnings.some((w) => w.field === 'origin')).toBe(true);
  });

  it('warns when booking status is Confirmed with no booking reference', () => {
    const warnings = validateTravelSegment(makeSegment({ bookingStatus: 'Confirmed', bookingReference: undefined }));
    expect(warnings.some((w) => w.field === 'bookingReference')).toBe(true);
  });

  it('does not warn when Confirmed status has a booking reference', () => {
    const warnings = validateTravelSegment(makeSegment({ bookingStatus: 'Confirmed', bookingReference: 'KUR-88410' }));
    expect(warnings.some((w) => w.field === 'bookingReference')).toBe(false);
  });

  it('warns when departure date is before arrival date on the same segment', () => {
    const warnings = validateTravelSegment(makeSegment({ arrivalDate: '2027-01-28', departureDate: '2027-01-20' }));
    expect(warnings.some((w) => w.field === 'departureDate')).toBe(true);
  });

  it('warns when Wedding travel dates are far from the Wedding date', () => {
    const warnings = validateTravelSegment(makeSegment({ event: 'Wedding', arrivalDate: '2026-12-01' }));
    expect(warnings.some((w) => w.field === 'event')).toBe(true);
  });

  it('does not warn when Wedding travel dates are close to the Wedding date', () => {
    const warnings = validateTravelSegment(makeSegment({ event: 'Wedding', arrivalDate: '2027-01-28' }));
    expect(warnings.some((w) => w.field === 'event')).toBe(false);
  });
});

describe('missing travel detection', () => {
  function makeHousehold(overrides: Partial<Household> = {}): Household {
    return {
      id: overrides.id ?? 'household-1',
      householdName: 'Test Family',
      primaryContactName: 'Test Contact',
      primaryPhone: '9000000000',
      side: 'Groom',
      relationshipCategory: 'Friend',
      city: 'Kochi',
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

  it('flags an outstation guest attending the Wedding with no travel segment', () => {
    const households = [makeHousehold({ city: 'Kochi' })];
    const guests = [makeGuest()];
    const missing = findGuestsWithMissingTravel(households, guests, []);
    expect(missing.some((g) => g.id === guests[0].id)).toBe(true);
  });

  it('does not flag a guest local to Hyderabad', () => {
    const households = [makeHousehold({ city: 'Hyderabad' })];
    const guests = [makeGuest()];
    const missing = findGuestsWithMissingTravel(households, guests, []);
    expect(missing).toHaveLength(0);
  });

  it('does not flag a guest who already has a travel segment', () => {
    const households = [makeHousehold({ city: 'Kochi' })];
    const guests = [makeGuest()];
    const segments = [makeSegment({ guestId: guests[0].id })];
    const missing = findGuestsWithMissingTravel(households, guests, segments);
    expect(missing).toHaveLength(0);
  });

  it('does not flag a guest who declined the Wedding', () => {
    const households = [makeHousehold({ city: 'Kochi' })];
    const guests = [makeGuest({ rsvpResponses: [{ event: 'Wedding', status: 'Declined' }] })];
    const missing = findGuestsWithMissingTravel(households, guests, []);
    expect(missing).toHaveLength(0);
  });
});
