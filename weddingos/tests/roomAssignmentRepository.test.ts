import { beforeEach, describe, expect, it } from 'vitest';
import {
  addRoomAssignment,
  deleteRoomAssignment,
  updateRoomAssignment,
  OverlappingRoomAssignmentError,
  RoomCapacityExceededError,
} from '@/data/repositories/roomAssignmentRepository';
import { addRoom, addRoomType } from '@/data/repositories/roomRepository';
import { addHotel } from '@/data/repositories/hotelRepository';
import { resetToDemoData, roomAssignmentsStore } from '@/data/stores';
import { computeRoomOccupancy, getRoomCapacity, validateRoomAssignment } from '@/utils/roomLogic';
import type { Guest, RoomType } from '@/types';

function setupHotelWithRoom(capacity = 2) {
  const hotel = addHotel({
    name: 'Test Hotel',
    area: 'Test Area',
    city: 'Hyderabad',
    breakfastIncluded: false,
    parkingAvailable: false,
    busAccess: false,
    accessibleRoomsAvailable: false,
  });
  const roomType = addRoomType({
    hotelId: hotel.id,
    name: 'Test Room Type',
    capacity,
    standardOccupancy: capacity,
    extraBedAllowed: false,
    childCotAllowed: false,
    accessible: false,
  });
  const room = addRoom({ hotelId: hotel.id, roomTypeId: roomType.id, roomNumber: '101', status: 'Available' });
  return { hotel, roomType, room };
}

describe('room assignment capacity enforcement (hard block)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('allows assignments up to the room capacity', () => {
    const { room } = setupHotelWithRoom(2);
    const before = roomAssignmentsStore.get().length;
    addRoomAssignment({
      roomId: room.id,
      guestId: 'guest-a',
      householdId: 'household-1',
      checkInDate: '2027-01-28',
      checkOutDate: '2027-01-31',
      assignmentStatus: 'Confirmed',
      primaryOccupant: true,
      extraBedRequired: false,
      childCotRequired: false,
      accessibilityRequired: false,
    });
    addRoomAssignment({
      roomId: room.id,
      guestId: 'guest-b',
      householdId: 'household-1',
      checkInDate: '2027-01-28',
      checkOutDate: '2027-01-31',
      assignmentStatus: 'Confirmed',
      primaryOccupant: false,
      extraBedRequired: false,
      childCotRequired: false,
      accessibilityRequired: false,
    });

    expect(roomAssignmentsStore.get()).toHaveLength(before + 2);
  });

  it('throws RoomCapacityExceededError when a third guest would exceed a 2-person room', () => {
    const { room } = setupHotelWithRoom(2);
    addRoomAssignment({
      roomId: room.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    addRoomAssignment({
      roomId: room.id, guestId: 'guest-b', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: false, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    const before = roomAssignmentsStore.get().length;

    expect(() =>
      addRoomAssignment({
        roomId: room.id, guestId: 'guest-c', householdId: 'household-1',
        checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
        primaryOccupant: false, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
      }),
    ).toThrow(RoomCapacityExceededError);

    // Never allow the capacity breach to persist — the third assignment must not have been written.
    expect(roomAssignmentsStore.get()).toHaveLength(before);
    expect(roomAssignmentsStore.get().filter((a) => a.roomId === room.id)).toHaveLength(2);
  });

  it('allows a capacity breach only when the room capacity is deliberately reduced below current occupants (via capacityOverride)', () => {
    const { room } = setupHotelWithRoom(2);
    addRoomAssignment({
      roomId: room.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    addRoomAssignment({
      roomId: room.id, guestId: 'guest-b', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: false, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });

    // This does not go through the repository's write guard — it simulates a
    // deliberate after-the-fact capacity change, exactly the one case the
    // spec allows a breach to exist (surfaced by the data-quality checks).
    room.capacityOverride = 1;
    expect(getRoomCapacity(room, undefined)).toBe(1);
  });

  it('throws OverlappingRoomAssignmentError when the same guest is assigned overlapping date ranges', () => {
    const { room: roomA } = setupHotelWithRoom(4);
    const { room: roomB } = setupHotelWithRoom(4);
    addRoomAssignment({
      roomId: roomA.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });

    expect(() =>
      addRoomAssignment({
        roomId: roomB.id, guestId: 'guest-a', householdId: 'household-1',
        checkInDate: '2027-01-29', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed',
        primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
      }),
    ).toThrow(OverlappingRoomAssignmentError);
  });

  it('allows the same guest to hold two assignments with non-overlapping date ranges', () => {
    const { room: roomA } = setupHotelWithRoom(4);
    const { room: roomB } = setupHotelWithRoom(4);
    addRoomAssignment({
      roomId: roomA.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-10', checkOutDate: '2027-01-12', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    const second = addRoomAssignment({
      roomId: roomB.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    expect(second.id).toBeTruthy();
  });

  it('throws RoomCapacityExceededError on update when moving a guest into an already-full room', () => {
    const { room: fullRoom } = setupHotelWithRoom(1);
    addRoomAssignment({
      roomId: fullRoom.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    const { room: otherRoom } = setupHotelWithRoom(2);
    const movable = addRoomAssignment({
      roomId: otherRoom.id, guestId: 'guest-b', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });

    expect(() => updateRoomAssignment(movable.id, { roomId: fullRoom.id })).toThrow(RoomCapacityExceededError);
  });

  it('deletes a room assignment', () => {
    const { room } = setupHotelWithRoom(2);
    const assignment = addRoomAssignment({
      roomId: room.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    deleteRoomAssignment(assignment.id);
    expect(roomAssignmentsStore.get().some((a) => a.id === assignment.id)).toBe(false);
  });
});

describe('room occupancy computation', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('computes occupant count and available spaces for a room', () => {
    const { room, roomType } = setupHotelWithRoom(3);
    addRoomAssignment({
      roomId: room.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    const occupancy = computeRoomOccupancy(room, roomType, roomAssignmentsStore.get());
    expect(occupancy.occupantCount).toBe(1);
    expect(occupancy.availableSpaces).toBe(2);
  });

  it('excludes cancelled assignments from occupancy', () => {
    const { room, roomType } = setupHotelWithRoom(2);
    const assignment = addRoomAssignment({
      roomId: room.id, guestId: 'guest-a', householdId: 'household-1',
      checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed',
      primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
    });
    updateRoomAssignment(assignment.id, { assignmentStatus: 'Cancelled' });
    const occupancy = computeRoomOccupancy(room, roomType, roomAssignmentsStore.get());
    expect(occupancy.occupantCount).toBe(0);
  });
});

describe('accessibility and cot/bed compatibility warnings', () => {
  function makeGuest(overrides: Partial<Guest> = {}): Guest {
    return {
      id: 'guest-1', householdId: 'household-1', fullName: 'Test Guest', ageCategory: 'Adult',
      invitedEvents: ['Wedding'], rsvpResponses: [], dietaryPreference: 'Not Specified',
      elderlyAssistanceRequired: false, accommodationRequired: true, travelDetailsRequired: false,
      pickupRequired: false, plusOneStatus: 'Not Applicable',
      createdAt: '2026-07-01T00:00:00.000Z', updatedAt: '2026-07-01T00:00:00.000Z',
      ...overrides,
    };
  }
  function makeRoomType(overrides: Partial<RoomType> = {}): RoomType {
    return {
      id: 'rt-1', hotelId: 'hotel-1', name: 'Deluxe King', capacity: 2, standardOccupancy: 2,
      extraBedAllowed: false, childCotAllowed: false, accessible: false,
      ...overrides,
    };
  }

  it('warns when accessibility is required but the room type is not accessible', () => {
    const warnings = validateRoomAssignment(
      { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', extraBedRequired: false, childCotRequired: false, accessibilityRequired: true },
      { guest: makeGuest(), roomType: makeRoomType({ accessible: false }) },
    );
    expect(warnings.some((w) => w.field === 'accessibilityRequired')).toBe(true);
  });

  it('does not warn when accessibility is required and the room type is accessible', () => {
    const warnings = validateRoomAssignment(
      { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', extraBedRequired: false, childCotRequired: false, accessibilityRequired: true },
      { guest: makeGuest(), roomType: makeRoomType({ accessible: true }) },
    );
    expect(warnings.some((w) => w.field === 'accessibilityRequired')).toBe(false);
  });

  it('warns when a child cot is requested but the room type does not allow one', () => {
    const warnings = validateRoomAssignment(
      { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', extraBedRequired: false, childCotRequired: true, accessibilityRequired: false },
      { guest: makeGuest(), roomType: makeRoomType({ childCotAllowed: false }) },
    );
    expect(warnings.some((w) => w.field === 'childCotRequired')).toBe(true);
  });

  it('warns when an extra bed is requested but the room type does not allow one', () => {
    const warnings = validateRoomAssignment(
      { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', extraBedRequired: true, childCotRequired: false, accessibilityRequired: false },
      { guest: makeGuest(), roomType: makeRoomType({ extraBedAllowed: false }) },
    );
    expect(warnings.some((w) => w.field === 'extraBedRequired')).toBe(true);
  });

  it('does not warn about cot/bed compatibility when the room type allows both', () => {
    const warnings = validateRoomAssignment(
      { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', extraBedRequired: true, childCotRequired: true, accessibilityRequired: false },
      { guest: makeGuest(), roomType: makeRoomType({ extraBedAllowed: true, childCotAllowed: true }) },
    );
    expect(warnings.some((w) => w.field === 'extraBedRequired' || w.field === 'childCotRequired')).toBe(false);
  });

  it('warns when the guest has not actually requested accommodation', () => {
    const warnings = validateRoomAssignment(
      { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', extraBedRequired: false, childCotRequired: false, accessibilityRequired: false },
      { guest: makeGuest({ accommodationRequired: false }), roomType: makeRoomType() },
    );
    expect(warnings.some((w) => w.field === 'guestId')).toBe(true);
  });
});
