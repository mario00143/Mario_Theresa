import type {
  Driver,
  Guest,
  Household,
  Room,
  RoomAssignment,
  RoomType,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
} from '@/types';
import { getGuestRsvpStatus } from './rsvpLogic';
import { findGuestsRequiringAccommodationUnassigned, findGuestsWithMissingTravel } from './logisticsStats';
import { dateRangesOverlap, getRoomCapacity, isRoomAssignmentActive } from './roomLogic';
import {
  findOverlappingRoutesForDriver,
  findOverlappingRoutesForVehicle,
  guestHasOverlappingRouteAssignments,
  isTransportAssignmentActive,
  seatsAssignedForRoute,
} from './transportLogic';
import { parseDate } from './date';

export type LogisticsIssueCategory =
  | 'outstation-guest-no-travel'
  | 'confirmed-travel-missing-reference'
  | 'pickup-no-assignment'
  | 'drop-no-assignment'
  | 'accommodation-unassigned'
  | 'overlapping-room-assignment'
  | 'overlapping-transport-assignment'
  | 'room-capacity-exceeded'
  | 'vehicle-capacity-exceeded'
  | 'route-no-driver'
  | 'route-no-vehicle'
  | 'driver-overlapping-routes'
  | 'vehicle-overlapping-routes'
  | 'accessible-guest-non-accessible-room'
  | 'guest-arrives-after-shuttle'
  | 'checkout-before-departure'
  | 'travel-inconsistent-with-rsvp';

export interface LogisticsIssue {
  id: string;
  category: LogisticsIssueCategory;
  message: string;
  linkType: 'guest' | 'household' | 'travel' | 'room' | 'vehicle' | 'route' | 'driver';
  linkId: string;
}

export interface LogisticsDataInput {
  households: Household[];
  guests: Guest[];
  travelSegments: TravelSegment[];
  rooms: Room[];
  roomTypes: RoomType[];
  roomAssignments: RoomAssignment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: TransportRoute[];
  transportAssignments: TransportAssignment[];
}

export function detectLogisticsIssues(input: LogisticsDataInput): LogisticsIssue[] {
  const issues: LogisticsIssue[] = [];
  const {
    households,
    guests,
    travelSegments,
    rooms,
    roomTypes,
    roomAssignments,
    vehicles,
    drivers,
    routes,
    transportAssignments,
  } = input;

  const guestById = new Map(guests.map((g) => [g.id, g]));
  const roomTypeById = new Map(roomTypes.map((rt) => [rt.id, rt]));

  // 1. Outstation attending guest with no travel recorded.
  for (const guest of findGuestsWithMissingTravel(households, guests, travelSegments)) {
    issues.push({
      id: `no-travel-${guest.id}`,
      category: 'outstation-guest-no-travel',
      message: `"${guest.fullName}" is attending the Wedding from outside Hyderabad but has no travel recorded.`,
      linkType: 'guest',
      linkId: guest.id,
    });
  }

  // 2, 3, 4, 17: per-segment checks.
  for (const segment of travelSegments) {
    const guest = guestById.get(segment.guestId);
    const guestName = guest?.fullName ?? 'Unknown guest';

    if (segment.bookingStatus === 'Confirmed' && !segment.bookingReference?.trim()) {
      issues.push({
        id: `missing-reference-${segment.id}`,
        category: 'confirmed-travel-missing-reference',
        message: `${guestName}'s ${segment.direction.toLowerCase()} travel is Confirmed but has no booking reference.`,
        linkType: 'travel',
        linkId: segment.id,
      });
    }

    if (segment.direction === 'Arrival' && segment.pickupRequired) {
      const hasAssignment = transportAssignments.some((a) => a.travelSegmentId === segment.id && isTransportAssignmentActive(a));
      if (!hasAssignment) {
        issues.push({
          id: `pickup-unassigned-${segment.id}`,
          category: 'pickup-no-assignment',
          message: `${guestName} requires pickup on arrival but has no transport assignment.`,
          linkType: 'travel',
          linkId: segment.id,
        });
      }
    }

    if (segment.direction === 'Departure' && segment.dropRequired) {
      const hasAssignment = transportAssignments.some((a) => a.travelSegmentId === segment.id && isTransportAssignmentActive(a));
      if (!hasAssignment) {
        issues.push({
          id: `drop-unassigned-${segment.id}`,
          category: 'drop-no-assignment',
          message: `${guestName} requires a drop for departure but has no transport assignment.`,
          linkType: 'travel',
          linkId: segment.id,
        });
      }
    }

    if (guest) {
      const segmentEvent = segment.event;
      const relevantEvents = segmentEvent === 'Both' ? (['Engagement', 'Wedding'] as const) : ([segmentEvent] as const);
      const attendsNone = relevantEvents.every((event) => {
        if (!guest.invitedEvents.includes(event)) return true;
        return getGuestRsvpStatus(guest, event) === 'Declined';
      });
      if (attendsNone) {
        issues.push({
          id: `travel-inconsistent-${segment.id}`,
          category: 'travel-inconsistent-with-rsvp',
          message: `${guestName} has travel booked for ${segmentEvent} but is not attending that event.`,
          linkType: 'travel',
          linkId: segment.id,
        });
      }
    }
  }

  // 5. Accommodation requested but unassigned.
  for (const guest of findGuestsRequiringAccommodationUnassigned(guests, roomAssignments)) {
    issues.push({
      id: `accommodation-unassigned-${guest.id}`,
      category: 'accommodation-unassigned',
      message: `"${guest.fullName}" requires accommodation but has no room assigned.`,
      linkType: 'guest',
      linkId: guest.id,
    });
  }

  // 6, 14: overlapping room assignments per guest, and accessibility mismatch.
  const activeRoomAssignments = roomAssignments.filter(isRoomAssignmentActive);
  for (let i = 0; i < activeRoomAssignments.length; i++) {
    const a = activeRoomAssignments[i];
    const guestName = guestById.get(a.guestId)?.fullName ?? 'Unknown guest';

    for (let j = i + 1; j < activeRoomAssignments.length; j++) {
      const b = activeRoomAssignments[j];
      if (a.guestId === b.guestId && dateRangesOverlap(a.checkInDate, a.checkOutDate, b.checkInDate, b.checkOutDate)) {
        issues.push({
          id: `overlapping-room-${a.id}-${b.id}`,
          category: 'overlapping-room-assignment',
          message: `${guestName} is assigned to overlapping room stays.`,
          linkType: 'guest',
          linkId: a.guestId,
        });
      }
    }

    if (a.accessibilityRequired) {
      const room = rooms.find((r) => r.id === a.roomId);
      const roomType = room ? roomTypeById.get(room.roomTypeId) : undefined;
      if (!roomType?.accessible) {
        issues.push({
          id: `accessible-mismatch-${a.id}`,
          category: 'accessible-guest-non-accessible-room',
          message: `${guestName} needs an accessible room but is assigned to a non-accessible room type.`,
          linkType: 'guest',
          linkId: a.guestId,
        });
      }
    }

    // 16. Checks out before their recorded departure travel date, with no note about a holding arrangement.
    const departure = travelSegments.find((s) => s.guestId === a.guestId && s.direction === 'Departure' && s.departureDate);
    if (departure?.departureDate) {
      const checkOut = parseDate(a.checkOutDate);
      const departureDate = parseDate(departure.departureDate);
      if (checkOut && departureDate && checkOut.getTime() < departureDate.getTime() && !a.notes?.trim()) {
        issues.push({
          id: `checkout-before-departure-${a.id}`,
          category: 'checkout-before-departure',
          message: `${guestName} checks out before their departure travel date, with no holding arrangement noted.`,
          linkType: 'guest',
          linkId: a.guestId,
        });
      }
    }
  }

  // 8. Room capacity exceeded.
  for (const room of rooms) {
    const roomType = roomTypeById.get(room.roomTypeId);
    const capacity = getRoomCapacity(room, roomType);
    const occupants = activeRoomAssignments.filter((a) => a.roomId === room.id).length;
    if (occupants > capacity) {
      issues.push({
        id: `room-capacity-${room.id}`,
        category: 'room-capacity-exceeded',
        message: `Room ${room.roomNumber} has ${occupants} occupant(s) assigned but only ${capacity} capacity.`,
        linkType: 'room',
        linkId: room.id,
      });
    }
  }

  // 7. Guest assigned to overlapping transport routes.
  for (const guest of guests) {
    if (guestHasOverlappingRouteAssignments(guest.id, transportAssignments, routes)) {
      issues.push({
        id: `overlapping-transport-${guest.id}`,
        category: 'overlapping-transport-assignment',
        message: `"${guest.fullName}" is assigned to overlapping transport routes.`,
        linkType: 'guest',
        linkId: guest.id,
      });
    }
  }

  // 9, 10, 11: vehicle capacity, missing driver, missing vehicle.
  for (const route of routes) {
    if (!route.vehicleId) {
      issues.push({
        id: `route-no-vehicle-${route.id}`,
        category: 'route-no-vehicle',
        message: `Route "${route.name}" has no vehicle assigned.`,
        linkType: 'route',
        linkId: route.id,
      });
    } else {
      const vehicle = vehicles.find((v) => v.id === route.vehicleId);
      if (vehicle) {
        const assignedSeats = seatsAssignedForRoute(transportAssignments, route.id);
        if (assignedSeats > vehicle.passengerCapacity) {
          issues.push({
            id: `vehicle-capacity-${route.id}`,
            category: 'vehicle-capacity-exceeded',
            message: `Route "${route.name}" has ${assignedSeats} seat(s) assigned but ${vehicle.name} seats ${vehicle.passengerCapacity}.`,
            linkType: 'route',
            linkId: route.id,
          });
        }
      }
    }

    if (!route.driverId) {
      issues.push({
        id: `route-no-driver-${route.id}`,
        category: 'route-no-driver',
        message: `Route "${route.name}" has no driver assigned.`,
        linkType: 'route',
        linkId: route.id,
      });
    }

    // 15. Guest arrives after their assigned wedding (church/reception) shuttle departs.
    if (route.routeType === 'Church Shuttle' || route.routeType === 'Reception Shuttle') {
      const routeAssignments = transportAssignments.filter((a) => a.routeId === route.id && isTransportAssignmentActive(a));
      for (const assignment of routeAssignments) {
        const arrival = travelSegments.find((s) => s.guestId === assignment.guestId && s.direction === 'Arrival');
        if (arrival?.arrivalDate && arrival.arrivalTime && route.plannedDepartureDate && route.plannedDepartureTime) {
          const arrivalDateTime = parseDate(`${arrival.arrivalDate}T${arrival.arrivalTime}`);
          const shuttleDateTime = parseDate(`${route.plannedDepartureDate}T${route.plannedDepartureTime}`);
          if (arrivalDateTime && shuttleDateTime && arrivalDateTime.getTime() > shuttleDateTime.getTime()) {
            issues.push({
              id: `arrives-after-shuttle-${assignment.id}`,
              category: 'guest-arrives-after-shuttle',
              message: `${guestById.get(assignment.guestId)?.fullName ?? 'Guest'} arrives after the "${route.name}" shuttle departs.`,
              linkType: 'guest',
              linkId: assignment.guestId,
            });
          }
        }
      }
    }
  }

  // 12, 13: driver/vehicle overlapping routes.
  for (const driver of drivers) {
    if (findOverlappingRoutesForDriver(driver, routes).length > 0) {
      issues.push({
        id: `driver-overlap-${driver.id}`,
        category: 'driver-overlapping-routes',
        message: `Driver ${driver.name} is assigned to overlapping routes.`,
        linkType: 'driver',
        linkId: driver.id,
      });
    }
  }
  for (const vehicle of vehicles) {
    if (findOverlappingRoutesForVehicle(vehicle, routes).length > 0) {
      issues.push({
        id: `vehicle-overlap-${vehicle.id}`,
        category: 'vehicle-overlapping-routes',
        message: `${vehicle.name} is assigned to overlapping routes.`,
        linkType: 'vehicle',
        linkId: vehicle.id,
      });
    }
  }

  return issues;
}
