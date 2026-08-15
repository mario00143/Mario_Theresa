import { describe, expect, it } from 'vitest';
import {
  buildArrivalReport,
  buildPickupExceptionReport,
  buildRoomOccupancyReport,
  buildVehicleUtilizationReport,
} from '@/utils/logisticsReports';
import type { Guest, Hotel, Household, Room, RoomAssignment, RoomType, TransportAssignment, TransportRoute, TravelSegment, Vehicle } from '@/types';

function makeHousehold(overrides: Partial<Household> = {}): Household {
  return {
    id: 'household-1', householdName: 'Test Family', primaryContactName: 'Test Contact', primaryPhone: '9000000000',
    side: 'Groom', relationshipCategory: 'Friend', city: 'Kochi', country: 'India',
    invitationPriority: 'Standard', invitedEvents: ['Wedding'], invitationMethod: [], invitationStatus: 'Sent',
    createdAt: '', updatedAt: '',
    ...overrides,
  };
}

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'guest-1', householdId: 'household-1', fullName: 'Test Guest', ageCategory: 'Adult',
    invitedEvents: ['Wedding'], rsvpResponses: [], dietaryPreference: 'Not Specified',
    elderlyAssistanceRequired: false, accommodationRequired: false, travelDetailsRequired: false,
    pickupRequired: false, plusOneStatus: 'Not Applicable', createdAt: '', updatedAt: '',
    ...overrides,
  };
}

function makeSegment(overrides: Partial<TravelSegment> = {}): TravelSegment {
  return {
    id: 'travel-1', guestId: 'guest-1', householdId: 'household-1', event: 'Wedding', direction: 'Arrival',
    travelMode: 'Flight', origin: 'Kochi', destination: 'RGIA (Hyderabad Airport)', bookingStatus: 'Confirmed',
    ticketConfirmed: true, pickupRequired: false, dropRequired: false, createdAt: '', updatedAt: '',
    ...overrides,
  };
}

describe('arrival report', () => {
  it('includes origin, mode, arrival details, and pickup status for each arriving guest', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest()];
    const segments = [makeSegment({ arrivalDate: '2027-01-28', arrivalTime: '14:10', pickupRequired: true })];
    const rows = buildArrivalReport(segments, households, guests, [], [], [], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0].guest.fullName).toBe('Test Guest');
    expect(rows[0].origin).toBe('Kochi');
    expect(rows[0].pickupRequired).toBe(true);
    expect(rows[0].pickupAssignmentStatus).toBe('Unassigned');
  });

  it('reports a Confirmed pickup assignment status when one is linked to the segment', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest()];
    const segments = [makeSegment({ id: 'travel-1', arrivalDate: '2027-01-28', arrivalTime: '14:10', pickupRequired: true })];
    const transportAssignments: TransportAssignment[] = [
      { id: 'ta-1', routeId: 'route-1', guestId: 'guest-1', travelSegmentId: 'travel-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const rows = buildArrivalReport(segments, households, guests, [], [], [], [], transportAssignments);
    expect(rows[0].pickupAssignmentStatus).toBe('Confirmed');
  });

  it('excludes departure segments', () => {
    const households = [makeHousehold()];
    const guests = [makeGuest()];
    const segments = [makeSegment({ direction: 'Departure', departureDate: '2027-01-31', departureTime: '10:00' })];
    const rows = buildArrivalReport(segments, households, guests, [], [], [], [], []);
    expect(rows).toHaveLength(0);
  });
});

describe('room occupancy report', () => {
  it('computes occupancy, capacity, and available spaces per room', () => {
    const hotel: Hotel = {
      id: 'hotel-1', name: 'Test Hotel', area: 'Test Area', city: 'Hyderabad', breakfastIncluded: false,
      parkingAvailable: false, busAccess: false, accessibleRoomsAvailable: false, createdAt: '', updatedAt: '',
    };
    const roomType: RoomType = { id: 'rt-1', hotelId: 'hotel-1', name: 'Deluxe King', capacity: 2, standardOccupancy: 2, extraBedAllowed: false, childCotAllowed: false, accessible: false };
    const room: Room = { id: 'room-1', hotelId: 'hotel-1', roomTypeId: 'rt-1', roomNumber: '101', status: 'Assigned' };
    const guest = makeGuest();
    const roomAssignments: RoomAssignment[] = [
      { id: 'ra-1', roomId: 'room-1', guestId: 'guest-1', householdId: 'household-1', checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false, createdAt: '', updatedAt: '' },
    ];

    const rows = buildRoomOccupancyReport([hotel], [room], [roomType], roomAssignments, [guest]);
    expect(rows).toHaveLength(1);
    expect(rows[0].capacity).toBe(2);
    expect(rows[0].occupantCount).toBe(1);
    expect(rows[0].availableSpaces).toBe(1);
    expect(rows[0].occupantNames).toEqual(['Test Guest']);
  });

  it('excludes cancelled room assignments from occupancy', () => {
    const hotel: Hotel = {
      id: 'hotel-1', name: 'Test Hotel', area: 'Test Area', city: 'Hyderabad', breakfastIncluded: false,
      parkingAvailable: false, busAccess: false, accessibleRoomsAvailable: false, createdAt: '', updatedAt: '',
    };
    const roomType: RoomType = { id: 'rt-1', hotelId: 'hotel-1', name: 'Deluxe King', capacity: 2, standardOccupancy: 2, extraBedAllowed: false, childCotAllowed: false, accessible: false };
    const room: Room = { id: 'room-1', hotelId: 'hotel-1', roomTypeId: 'rt-1', roomNumber: '101', status: 'Available' };
    const roomAssignments: RoomAssignment[] = [
      { id: 'ra-1', roomId: 'room-1', guestId: 'guest-1', householdId: 'household-1', checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Cancelled', primaryOccupant: true, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false, createdAt: '', updatedAt: '' },
    ];
    const rows = buildRoomOccupancyReport([hotel], [room], [roomType], roomAssignments, [makeGuest()]);
    expect(rows[0].occupantCount).toBe(0);
    expect(rows[0].availableSpaces).toBe(2);
  });
});

describe('vehicle utilization report', () => {
  it('sums assigned seats across all of a vehicle\'s routes', () => {
    const vehicle: Vehicle = { id: 'vehicle-1', name: 'Test Vehicle', vehicleType: 'Innova / MUV', passengerCapacity: 6, airConditioned: true, status: 'Assigned', backupVehicle: false, createdAt: '', updatedAt: '' };
    const routes: TransportRoute[] = [
      { id: 'route-1', name: 'Route A', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA', destination: 'Hotel', vehicleId: 'vehicle-1', status: 'Confirmed', createdAt: '', updatedAt: '' },
      { id: 'route-2', name: 'Route B', event: 'Wedding', routeType: 'Airport Drop', origin: 'Hotel', destination: 'RGIA', vehicleId: 'vehicle-1', status: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const transportAssignments: TransportAssignment[] = [
      { id: 'ta-1', routeId: 'route-1', guestId: 'guest-1', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed', createdAt: '', updatedAt: '' },
      { id: 'ta-2', routeId: 'route-2', guestId: 'guest-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const rows = buildVehicleUtilizationReport([vehicle], routes, transportAssignments);
    expect(rows[0].assignedSeats).toBe(3);
    expect(rows[0].remainingSeats).toBe(3);
    expect(rows[0].routeCount).toBe(2);
  });

  it('never reports negative remaining seats when over capacity', () => {
    const vehicle: Vehicle = { id: 'vehicle-1', name: 'Test Vehicle', vehicleType: 'Sedan', passengerCapacity: 2, airConditioned: true, status: 'Assigned', backupVehicle: false, createdAt: '', updatedAt: '' };
    const routes: TransportRoute[] = [
      { id: 'route-1', name: 'Route A', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA', destination: 'Hotel', vehicleId: 'vehicle-1', status: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const transportAssignments: TransportAssignment[] = [
      { id: 'ta-1', routeId: 'route-1', guestId: 'guest-1', seatCount: 5, assistanceRequired: false, assignmentStatus: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const rows = buildVehicleUtilizationReport([vehicle], routes, transportAssignments);
    expect(rows[0].assignedSeats).toBe(5);
    expect(rows[0].remainingSeats).toBe(0);
  });
});

describe('pickup exception report (exception counts)', () => {
  it('lists a guest whose pickup segment has no transport assignment at all', () => {
    const guest = makeGuest();
    const segments = [makeSegment({ id: 'travel-1', pickupRequired: true })];
    const rows = buildPickupExceptionReport(segments, [guest], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0].reasons).toContain('No route assigned');
  });

  it('lists a guest whose assigned route has no vehicle or driver', () => {
    const guest = makeGuest();
    const segments = [makeSegment({ id: 'travel-1', pickupRequired: true })];
    const routes: TransportRoute[] = [
      { id: 'route-1', name: 'Route A', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA', destination: 'Hotel', status: 'Planned', createdAt: '', updatedAt: '' },
    ];
    const transportAssignments: TransportAssignment[] = [
      { id: 'ta-1', routeId: 'route-1', guestId: 'guest-1', travelSegmentId: 'travel-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const rows = buildPickupExceptionReport(segments, [guest], transportAssignments, routes);
    expect(rows).toHaveLength(1);
    expect(rows[0].reasons).toEqual(expect.arrayContaining(['No vehicle assigned', 'No driver assigned']));
  });

  it('excludes a guest whose route has both a vehicle and a driver', () => {
    const guest = makeGuest();
    const segments = [makeSegment({ id: 'travel-1', pickupRequired: true })];
    const routes: TransportRoute[] = [
      { id: 'route-1', name: 'Route A', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA', destination: 'Hotel', vehicleId: 'vehicle-1', driverId: 'driver-1', status: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const transportAssignments: TransportAssignment[] = [
      { id: 'ta-1', routeId: 'route-1', guestId: 'guest-1', travelSegmentId: 'travel-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed', createdAt: '', updatedAt: '' },
    ];
    const rows = buildPickupExceptionReport(segments, [guest], transportAssignments, routes);
    expect(rows).toHaveLength(0);
  });

  it('excludes segments that do not require pickup', () => {
    const guest = makeGuest();
    const segments = [makeSegment({ pickupRequired: false })];
    const rows = buildPickupExceptionReport(segments, [guest], [], []);
    expect(rows).toHaveLength(0);
  });
});
