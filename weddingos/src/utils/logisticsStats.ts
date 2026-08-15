import type { Hotel, Guest, Household, Room, RoomAssignment, RoomType, TransportAssignment, TransportRoute, TravelSegment, Vehicle } from '@/types';
import { getGuestRsvpStatus } from './rsvpLogic';
import { isRoomAssignmentActive, getRoomCapacity } from './roomLogic';
import { isTransportAssignmentActive, seatsAssignedForRoute } from './transportLogic';
import { timeToMinutes } from './arrivalClustering';

/** Guests whose household is outside this city are assumed to need travel logistics tracked. */
export const DEFAULT_LOCAL_CITY = 'Hyderabad';

export function findGuestsWithMissingTravel(
  households: Household[],
  guests: Guest[],
  travelSegments: TravelSegment[],
  localCity: string = DEFAULT_LOCAL_CITY,
): Guest[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const guestIdsWithTravel = new Set(travelSegments.map((t) => t.guestId));
  return guests.filter((g) => {
    const household = householdById.get(g.householdId);
    if (!household) return false;
    if (household.city.trim().toLowerCase() === localCity.toLowerCase()) return false;
    if (!g.invitedEvents.includes('Wedding')) return false;
    if (getGuestRsvpStatus(g, 'Wedding') !== 'Attending') return false;
    return !guestIdsWithTravel.has(g.id);
  });
}

export function findGuestsRequiringAccommodationUnassigned(guests: Guest[], roomAssignments: RoomAssignment[]): Guest[] {
  const guestIdsWithRoom = new Set(roomAssignments.filter(isRoomAssignmentActive).map((a) => a.guestId));
  return guests.filter((g) => g.accommodationRequired && !guestIdsWithRoom.has(g.id));
}

export interface LogisticsOverviewStats {
  travel: {
    arrivalSegments: number;
    departureSegments: number;
    confirmedBookings: number;
    unconfirmedBookings: number;
    guestsMissingTravel: number;
  };
  accommodation: {
    guestsRequestingAccommodation: number;
    assigned: number;
    unassigned: number;
  };
  rooms: {
    availableBeds: number;
    accessibilityConflicts: number;
  };
  transport: {
    pickupsRequested: number;
    pickupsAssigned: number;
    dropsRequested: number;
    dropsAssigned: number;
  };
  vehicles: {
    totalVehicles: number;
    totalRoutes: number;
    capacityConflicts: number;
  };
}

export function computeLogisticsOverview(
  households: Household[],
  guests: Guest[],
  travelSegments: TravelSegment[],
  roomTypes: RoomType[],
  rooms: Room[],
  roomAssignments: RoomAssignment[],
  vehicles: Vehicle[],
  routes: TransportRoute[],
  transportAssignments: TransportAssignment[],
): LogisticsOverviewStats {
  const activeRoomAssignments = roomAssignments.filter(isRoomAssignmentActive);
  const roomTypeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  const guestsRequestingAccommodation = guests.filter((g) => g.accommodationRequired).length;
  const assignedAccommodation = findGuestsRequiringAccommodationUnassigned(guests, roomAssignments);

  const availableBeds = rooms.reduce((sum, room) => {
    const roomType = roomTypeById.get(room.roomTypeId);
    const capacity = getRoomCapacity(room, roomType);
    const occupants = activeRoomAssignments.filter((a) => a.roomId === room.id).length;
    return sum + Math.max(0, capacity - occupants);
  }, 0);

  const accessibilityConflicts = activeRoomAssignments.filter((a) => {
    if (!a.accessibilityRequired) return false;
    const room = rooms.find((r) => r.id === a.roomId);
    const roomType = room ? roomTypeById.get(room.roomTypeId) : undefined;
    return !roomType?.accessible;
  }).length;

  const activeTransportAssignments = transportAssignments.filter(isTransportAssignmentActive);
  const arrivalSegmentsList = travelSegments.filter((s) => s.direction === 'Arrival');
  const departureSegmentsList = travelSegments.filter((s) => s.direction === 'Departure');

  const pickupSegments = arrivalSegmentsList.filter((s) => s.pickupRequired);
  const dropSegments = departureSegmentsList.filter((s) => s.dropRequired);
  const assignedSegmentIds = new Set(activeTransportAssignments.map((a) => a.travelSegmentId).filter(Boolean));

  const capacityConflicts = routes.filter((route) => {
    if (!route.vehicleId) return false;
    const vehicle = vehicleById.get(route.vehicleId);
    if (!vehicle) return false;
    return seatsAssignedForRoute(transportAssignments, route.id) > vehicle.passengerCapacity;
  }).length;

  return {
    travel: {
      arrivalSegments: arrivalSegmentsList.length,
      departureSegments: departureSegmentsList.length,
      confirmedBookings: travelSegments.filter((s) => s.bookingStatus === 'Confirmed').length,
      unconfirmedBookings: travelSegments.filter(
        (s) => s.bookingStatus !== 'Confirmed' && s.bookingStatus !== 'Not Required' && s.bookingStatus !== 'Cancelled',
      ).length,
      guestsMissingTravel: findGuestsWithMissingTravel(households, guests, travelSegments).length,
    },
    accommodation: {
      guestsRequestingAccommodation,
      assigned: guestsRequestingAccommodation - assignedAccommodation.length,
      unassigned: assignedAccommodation.length,
    },
    rooms: {
      availableBeds,
      accessibilityConflicts,
    },
    transport: {
      pickupsRequested: pickupSegments.length,
      pickupsAssigned: pickupSegments.filter((s) => assignedSegmentIds.has(s.id)).length,
      dropsRequested: dropSegments.length,
      dropsAssigned: dropSegments.filter((s) => assignedSegmentIds.has(s.id)).length,
    },
    vehicles: {
      totalVehicles: vehicles.length,
      totalRoutes: routes.length,
      capacityConflicts,
    },
  };
}

export interface AccommodationQueueEntry {
  guest: Guest;
  household: Household | undefined;
  priorityReason: string;
  earliestArrivalDate?: string;
}

/**
 * Priority-sorted queue of guests who need a room but don't have one yet:
 * elderly/accessibility needs first, then families travelling with an
 * infant, then by earliest arrival date, then everyone else. This never
 * assigns anyone — it only orders the work.
 */
export function computeAccommodationQueue(
  guests: Guest[],
  households: Household[],
  roomAssignments: RoomAssignment[],
  travelSegments: TravelSegment[],
): AccommodationQueueEntry[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const unassigned = findGuestsRequiringAccommodationUnassigned(guests, roomAssignments);
  const infantHouseholdIds = new Set(guests.filter((g) => g.ageCategory === 'Infant').map((g) => g.householdId));

  const earliestArrivalByGuestId = new Map<string, string>();
  for (const segment of travelSegments) {
    if (segment.direction !== 'Arrival' || !segment.arrivalDate) continue;
    const existing = earliestArrivalByGuestId.get(segment.guestId);
    if (!existing || segment.arrivalDate < existing) earliestArrivalByGuestId.set(segment.guestId, segment.arrivalDate);
  }

  function tier(guest: Guest): { rank: number; reason: string } {
    if (guest.elderlyAssistanceRequired || guest.accessibilityRequirements) {
      return { rank: 0, reason: 'Elderly or accessibility assistance required' };
    }
    if (infantHouseholdIds.has(guest.householdId)) {
      return { rank: 1, reason: 'Travelling with an infant' };
    }
    if (earliestArrivalByGuestId.has(guest.id)) {
      return { rank: 2, reason: 'Sorted by earliest arrival' };
    }
    return { rank: 3, reason: 'No travel date on file yet' };
  }

  return unassigned
    .map((guest) => {
      const { rank, reason } = tier(guest);
      const earliestArrivalDate = earliestArrivalByGuestId.get(guest.id);
      return { guest, household: householdById.get(guest.householdId), priorityReason: reason, earliestArrivalDate, rank };
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.earliestArrivalDate && b.earliestArrivalDate) return a.earliestArrivalDate.localeCompare(b.earliestArrivalDate);
      if (a.earliestArrivalDate) return -1;
      if (b.earliestArrivalDate) return 1;
      return a.guest.fullName.localeCompare(b.guest.fullName);
    })
    .map(({ guest, household, priorityReason, earliestArrivalDate }) => ({ guest, household, priorityReason, earliestArrivalDate }));
}

export interface HotelIndicators {
  hotelId: string;
  roomCount: number;
  totalCapacity: number;
  occupantCount: number;
  overAllocatedRoomCount: number;
  accessibilityConflictCount: number;
  earlyArrivalCount: number;
  lateDepartureCount: number;
}

/**
 * Per-hotel operational indicators for the Hotels overview cards: whether
 * any room is over its capacity, whether an accessibility need is housed in
 * a non-accessible room type, and how many assigned guests arrive before
 * (or depart after) the hotel's posted check-in/check-out time — all
 * heuristic flags for the planner to review, not hard blocks.
 */
export function computeHotelIndicators(
  hotels: Hotel[],
  rooms: Room[],
  roomTypes: RoomType[],
  roomAssignments: RoomAssignment[],
  travelSegments: TravelSegment[],
): HotelIndicators[] {
  const roomTypeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
  const activeAssignments = roomAssignments.filter(isRoomAssignmentActive);

  return hotels.map((hotel) => {
    const hotelRooms = rooms.filter((r) => r.hotelId === hotel.id);
    const hotelRoomIds = new Set(hotelRooms.map((r) => r.id));
    const hotelAssignments = activeAssignments.filter((a) => hotelRoomIds.has(a.roomId));

    let totalCapacity = 0;
    let overAllocatedRoomCount = 0;
    for (const room of hotelRooms) {
      const roomType = roomTypeById.get(room.roomTypeId);
      const capacity = getRoomCapacity(room, roomType);
      totalCapacity += capacity;
      const occupants = hotelAssignments.filter((a) => a.roomId === room.id).length;
      if (occupants > capacity) overAllocatedRoomCount += 1;
    }

    const accessibilityConflictCount = hotelAssignments.filter((a) => {
      if (!a.accessibilityRequired) return false;
      const room = hotelRooms.find((r) => r.id === a.roomId);
      const roomType = room ? roomTypeById.get(room.roomTypeId) : undefined;
      return !roomType?.accessible;
    }).length;

    let earlyArrivalCount = 0;
    let lateDepartureCount = 0;
    for (const assignment of hotelAssignments) {
      const arrival = travelSegments.find((s) => s.guestId === assignment.guestId && s.direction === 'Arrival' && s.arrivalDate === assignment.checkInDate);
      if (arrival?.arrivalTime && hotel.checkInTime && timeToMinutes(arrival.arrivalTime) < timeToMinutes(hotel.checkInTime)) {
        earlyArrivalCount += 1;
      }
      const departure = travelSegments.find((s) => s.guestId === assignment.guestId && s.direction === 'Departure' && s.departureDate === assignment.checkOutDate);
      if (departure?.departureTime && hotel.checkOutTime && timeToMinutes(departure.departureTime) > timeToMinutes(hotel.checkOutTime)) {
        lateDepartureCount += 1;
      }
    }

    return {
      hotelId: hotel.id,
      roomCount: hotelRooms.length,
      totalCapacity,
      occupantCount: hotelAssignments.length,
      overAllocatedRoomCount,
      accessibilityConflictCount,
      earlyArrivalCount,
      lateDepartureCount,
    };
  });
}
