import type {
  Driver,
  Guest,
  Hotel,
  Household,
  Room,
  RoomAssignment,
  RoomType,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
} from '@/types';
import { isRoomAssignmentActive, getRoomCapacity } from './roomLogic';
import { isTransportAssignmentActive, seatsAssignedForRoute } from './transportLogic';

interface Lookups {
  householdById: Map<string, Household>;
  guestById: Map<string, Guest>;
  roomById: Map<string, Room>;
  roomTypeById: Map<string, RoomType>;
  hotelById: Map<string, Hotel>;
}

function buildLookups(households: Household[], guests: Guest[], rooms: Room[], roomTypes: RoomType[], hotels: Hotel[]): Lookups {
  return {
    householdById: new Map(households.map((h) => [h.id, h])),
    guestById: new Map(guests.map((g) => [g.id, g])),
    roomById: new Map(rooms.map((r) => [r.id, r])),
    roomTypeById: new Map(roomTypes.map((rt) => [rt.id, rt])),
    hotelById: new Map(hotels.map((h) => [h.id, h])),
  };
}

function activeAssignmentForGuest(guestId: string, roomAssignments: RoomAssignment[]): RoomAssignment | undefined {
  return roomAssignments.find((a) => a.guestId === guestId && isRoomAssignmentActive(a));
}

export interface ArrivalReportRow {
  guest: Guest;
  household: Household | undefined;
  origin: string;
  mode: TravelSegment['travelMode'];
  service: string;
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalLocation: string;
  pickupRequired: boolean;
  pickupAssignmentStatus: string;
  hotel: Hotel | undefined;
  roomNumber: string | undefined;
}

export function buildArrivalReport(
  segments: TravelSegment[],
  households: Household[],
  guests: Guest[],
  rooms: Room[],
  roomTypes: RoomType[],
  hotels: Hotel[],
  roomAssignments: RoomAssignment[],
  transportAssignments: TransportAssignment[],
): ArrivalReportRow[] {
  const lookups = buildLookups(households, guests, rooms, roomTypes, hotels);
  return segments
    .filter((s) => s.direction === 'Arrival')
    .map((segment) => {
      const guest = lookups.guestById.get(segment.guestId);
      const roomAssignment = guest ? activeAssignmentForGuest(guest.id, roomAssignments) : undefined;
      const room = roomAssignment ? lookups.roomById.get(roomAssignment.roomId) : undefined;
      const hotel = room ? lookups.hotelById.get(room.hotelId) : undefined;
      const pickupAssignment = transportAssignments.find((a) => a.travelSegmentId === segment.id && isTransportAssignmentActive(a));

      return {
        guest: guest as Guest,
        household: guest ? lookups.householdById.get(guest.householdId) : undefined,
        origin: segment.origin,
        mode: segment.travelMode,
        service: [segment.carrier, segment.serviceNumber].filter(Boolean).join(' '),
        arrivalDate: segment.arrivalDate,
        arrivalTime: segment.arrivalTime,
        arrivalLocation: segment.destination,
        pickupRequired: segment.pickupRequired,
        pickupAssignmentStatus: pickupAssignment ? pickupAssignment.assignmentStatus : 'Unassigned',
        hotel,
        roomNumber: room?.roomNumber,
      };
    })
    .filter((row) => row.guest);
}

export interface DepartureReportRow {
  guest: Guest;
  mode: TravelSegment['travelMode'];
  service: string;
  departureDate?: string;
  departureTime?: string;
  dropRequired: boolean;
  dropAssignmentStatus: string;
}

export function buildDepartureReport(
  segments: TravelSegment[],
  guests: Guest[],
  transportAssignments: TransportAssignment[],
): DepartureReportRow[] {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  return segments
    .filter((s) => s.direction === 'Departure')
    .map((segment) => {
      const guest = guestById.get(segment.guestId);
      const dropAssignment = transportAssignments.find((a) => a.travelSegmentId === segment.id && isTransportAssignmentActive(a));
      return {
        guest: guest as Guest,
        mode: segment.travelMode,
        service: [segment.carrier, segment.serviceNumber].filter(Boolean).join(' '),
        departureDate: segment.departureDate,
        departureTime: segment.departureTime,
        dropRequired: segment.dropRequired,
        dropAssignmentStatus: dropAssignment ? dropAssignment.assignmentStatus : 'Unassigned',
      };
    })
    .filter((row) => row.guest);
}

export interface AccommodationReportRow {
  guest: Guest;
  household: Household | undefined;
  hotel: Hotel | undefined;
  room: Room | undefined;
  checkInDate: string;
  checkOutDate: string;
  accessibilityRequired: boolean;
  extraBedRequired: boolean;
  childCotRequired: boolean;
}

export function buildAccommodationReport(
  roomAssignments: RoomAssignment[],
  households: Household[],
  guests: Guest[],
  rooms: Room[],
  roomTypes: RoomType[],
  hotels: Hotel[],
): AccommodationReportRow[] {
  const lookups = buildLookups(households, guests, rooms, roomTypes, hotels);
  return roomAssignments
    .filter(isRoomAssignmentActive)
    .map((assignment) => {
      const guest = lookups.guestById.get(assignment.guestId);
      const room = lookups.roomById.get(assignment.roomId);
      const hotel = room ? lookups.hotelById.get(room.hotelId) : undefined;
      return {
        guest: guest as Guest,
        household: guest ? lookups.householdById.get(guest.householdId) : undefined,
        hotel,
        room,
        checkInDate: assignment.checkInDate,
        checkOutDate: assignment.checkOutDate,
        accessibilityRequired: assignment.accessibilityRequired,
        extraBedRequired: assignment.extraBedRequired,
        childCotRequired: assignment.childCotRequired,
      };
    })
    .filter((row) => row.guest);
}

export interface UnassignedAccommodationRow {
  guest: Guest;
  household: Household | undefined;
  arrivalDate?: string;
  departureDate?: string;
  requirements: string[];
}

export function buildUnassignedAccommodationReport(
  guests: Guest[],
  households: Household[],
  roomAssignments: RoomAssignment[],
  travelSegments: TravelSegment[],
): UnassignedAccommodationRow[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const guestIdsWithRoom = new Set(roomAssignments.filter(isRoomAssignmentActive).map((a) => a.guestId));

  return guests
    .filter((g) => g.accommodationRequired && !guestIdsWithRoom.has(g.id))
    .map((guest) => {
      const arrival = travelSegments.find((s) => s.guestId === guest.id && s.direction === 'Arrival');
      const departure = travelSegments.find((s) => s.guestId === guest.id && s.direction === 'Departure');
      const requirements: string[] = [];
      if (guest.accessibilityRequirements) requirements.push('Accessibility');
      if (guest.elderlyAssistanceRequired) requirements.push('Elderly assistance');
      if (guest.infantRequirements) requirements.push('Infant needs');
      return {
        guest,
        household: householdById.get(guest.householdId),
        arrivalDate: arrival?.arrivalDate,
        departureDate: departure?.departureDate,
        requirements,
      };
    });
}

export interface PickupExceptionRow {
  guest: Guest;
  segment: TravelSegment;
  reasons: string[];
}

export function buildPickupExceptionReport(
  segments: TravelSegment[],
  guests: Guest[],
  transportAssignments: TransportAssignment[],
  routes: TransportRoute[],
): PickupExceptionRow[] {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const routeById = new Map(routes.map((r) => [r.id, r]));

  return segments
    .filter((s) => s.direction === 'Arrival' && s.pickupRequired)
    .map((segment) => {
      const guest = guestById.get(segment.guestId);
      const assignment = transportAssignments.find((a) => a.travelSegmentId === segment.id && isTransportAssignmentActive(a));
      const reasons: string[] = [];
      if (!assignment) {
        reasons.push('No route assigned');
      } else {
        const route = routeById.get(assignment.routeId);
        if (!route) reasons.push('No route assigned');
        else {
          if (!route.vehicleId) reasons.push('No vehicle assigned');
          if (!route.driverId) reasons.push('No driver assigned');
        }
      }
      return { guest: guest as Guest, segment, reasons };
    })
    .filter((row) => row.guest && row.reasons.length > 0);
}

export interface RoomOccupancyRow {
  hotel: Hotel;
  room: Room;
  roomType: RoomType | undefined;
  occupantNames: string[];
  capacity: number;
  occupantCount: number;
  availableSpaces: number;
}

export function buildRoomOccupancyReport(
  hotels: Hotel[],
  rooms: Room[],
  roomTypes: RoomType[],
  roomAssignments: RoomAssignment[],
  guests: Guest[],
): RoomOccupancyRow[] {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const roomTypeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
  const hotelById = new Map(hotels.map((h) => [h.id, h]));

  return rooms
    .map((room) => {
      const hotel = hotelById.get(room.hotelId);
      if (!hotel) return null;
      const roomType = roomTypeById.get(room.roomTypeId);
      const occupants = roomAssignments.filter((a) => a.roomId === room.id && isRoomAssignmentActive(a));
      const capacity = getRoomCapacity(room, roomType);
      return {
        hotel,
        room,
        roomType,
        occupantNames: occupants.map((a) => guestById.get(a.guestId)?.fullName).filter((n): n is string => Boolean(n)),
        capacity,
        occupantCount: occupants.length,
        availableSpaces: Math.max(0, capacity - occupants.length),
      };
    })
    .filter((row): row is RoomOccupancyRow => row !== null);
}

export interface VehicleUtilizationRow {
  vehicle: Vehicle;
  capacity: number;
  assignedSeats: number;
  remainingSeats: number;
  routeCount: number;
}

export function buildVehicleUtilizationReport(vehicles: Vehicle[], routes: TransportRoute[], transportAssignments: TransportAssignment[]): VehicleUtilizationRow[] {
  return vehicles.map((vehicle) => {
    const vehicleRoutes = routes.filter((r) => r.vehicleId === vehicle.id);
    const assignedSeats = vehicleRoutes.reduce((sum, route) => sum + seatsAssignedForRoute(transportAssignments, route.id), 0);
    return {
      vehicle,
      capacity: vehicle.passengerCapacity,
      assignedSeats,
      remainingSeats: Math.max(0, vehicle.passengerCapacity - assignedSeats),
      routeCount: vehicleRoutes.length,
    };
  });
}

export interface DriverDirectoryRow {
  driver: Driver;
  vehicle: Vehicle | undefined;
  activeRouteCount: number;
}

const ACTIVE_ROUTE_STATUSES = ['Planned', 'Confirmed', 'Dispatched', 'In Progress'];

export function buildDriverDirectory(drivers: Driver[], vehicles: Vehicle[], routes: TransportRoute[]): DriverDirectoryRow[] {
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  return drivers.map((driver) => ({
    driver,
    vehicle: driver.vehicleId ? vehicleById.get(driver.vehicleId) : undefined,
    activeRouteCount: routes.filter((r) => r.driverId === driver.id && ACTIVE_ROUTE_STATUSES.includes(r.status)).length,
  }));
}
