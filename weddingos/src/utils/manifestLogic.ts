import type {
  DutyAssignment,
  Driver,
  Guest,
  GuestOperationalStatus,
  Hotel,
  Household,
  Room,
  RoomAssignment,
  TransportAssignment,
  TransportRoute,
  Vehicle,
  Vendor,
  VendorContact,
  VendorDayStatus,
} from '@/types';

/** Every manifest builder here is a pure derivation from existing Phase 2-5 records — nothing new is stored (section 21/37). */

export interface GuestArrivalManifestRow {
  guestName: string;
  householdName: string;
  arrivalTime?: string;
  arrivalPoint?: string;
  pickupRoute?: string;
  vehicle?: string;
  driver?: string;
  hotel?: string;
  room?: string;
}

export function buildGuestArrivalManifest(
  guests: Guest[],
  households: Household[],
  transportAssignments: TransportAssignment[],
  routes: TransportRoute[],
  vehicles: Vehicle[],
  drivers: Driver[],
  roomAssignments: RoomAssignment[],
  rooms: Room[],
  hotels: Hotel[],
): GuestArrivalManifestRow[] {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const routeById = new Map(routes.map((r) => [r.id, r]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const driverById = new Map(drivers.map((d) => [d.id, d]));
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const hotelById = new Map(hotels.map((h) => [h.id, h]));

  return guests
    .filter((g) => transportAssignments.some((a) => a.guestId === g.id))
    .map((guest) => {
      const assignment = transportAssignments.find((a) => a.guestId === guest.id);
      const route = assignment ? routeById.get(assignment.routeId) : undefined;
      const vehicle = route?.vehicleId ? vehicleById.get(route.vehicleId) : undefined;
      const driver = route?.driverId ? driverById.get(route.driverId) : undefined;
      const roomAssignment = roomAssignments.find((r) => r.guestId === guest.id);
      const room = roomAssignment ? roomById.get(roomAssignment.roomId) : undefined;
      const hotel = room ? hotelById.get(room.hotelId) : undefined;
      return {
        guestName: guest.fullName,
        householdName: householdById.get(guest.householdId)?.householdName ?? 'Unknown',
        arrivalTime: assignment?.pickupTime,
        arrivalPoint: assignment?.pickupLocation,
        pickupRoute: route?.name,
        vehicle: vehicle?.name,
        driver: driver?.name,
        hotel: hotel?.name,
        room: room?.roomNumber,
      };
    });
}

export interface HotelRoomingManifestRow {
  hotelName: string;
  roomNumber: string;
  guestNames: string[];
  checkInDate: string;
  checkOutDate: string;
  specialNeeds?: string;
}

export function buildHotelRoomingManifest(roomAssignments: RoomAssignment[], rooms: Room[], hotels: Hotel[], guests: Guest[]): HotelRoomingManifestRow[] {
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const hotelById = new Map(hotels.map((h) => [h.id, h]));
  const guestById = new Map(guests.map((g) => [g.id, g]));

  const byRoom = new Map<string, RoomAssignment[]>();
  for (const assignment of roomAssignments) {
    const list = byRoom.get(assignment.roomId) ?? [];
    list.push(assignment);
    byRoom.set(assignment.roomId, list);
  }

  return Array.from(byRoom.entries()).map(([roomId, assignments]) => {
    const room = roomById.get(roomId);
    const hotel = room ? hotelById.get(room.hotelId) : undefined;
    const specialNeeds = assignments
      .filter((a) => a.extraBedRequired || a.childCotRequired || a.accessibilityRequired)
      .map((a) => [a.extraBedRequired && 'Extra bed', a.childCotRequired && 'Child cot', a.accessibilityRequired && 'Accessibility'].filter(Boolean).join(', '))
      .join('; ');
    return {
      hotelName: hotel?.name ?? 'Unknown',
      roomNumber: room?.roomNumber ?? 'Unknown',
      guestNames: assignments.map((a) => guestById.get(a.guestId)?.fullName ?? 'Unknown'),
      checkInDate: assignments[0]?.checkInDate ?? '',
      checkOutDate: assignments[0]?.checkOutDate ?? '',
      specialNeeds: specialNeeds || undefined,
    };
  });
}

export interface ShuttleManifestRow {
  hotelName?: string;
  routeName: string;
  departureTime?: string;
  vehicle?: string;
  driver?: string;
  guestNames: string[];
}

function buildShuttleManifest(routeType: TransportRoute['routeType'], routes: TransportRoute[], transportAssignments: TransportAssignment[], vehicles: Vehicle[], drivers: Driver[], guests: Guest[]): ShuttleManifestRow[] {
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const driverById = new Map(drivers.map((d) => [d.id, d]));
  const guestById = new Map(guests.map((g) => [g.id, g]));

  return routes
    .filter((r) => r.routeType === routeType)
    .map((route) => ({
      hotelName: route.origin,
      routeName: route.name,
      departureTime: route.plannedDepartureTime,
      vehicle: route.vehicleId ? vehicleById.get(route.vehicleId)?.name : undefined,
      driver: route.driverId ? driverById.get(route.driverId)?.name : undefined,
      guestNames: transportAssignments.filter((a) => a.routeId === route.id).map((a) => guestById.get(a.guestId)?.fullName ?? 'Unknown'),
    }));
}

export function buildChurchShuttleManifest(routes: TransportRoute[], transportAssignments: TransportAssignment[], vehicles: Vehicle[], drivers: Driver[], guests: Guest[]): ShuttleManifestRow[] {
  return buildShuttleManifest('Church Shuttle', routes, transportAssignments, vehicles, drivers, guests);
}

export function buildReceptionShuttleManifest(routes: TransportRoute[], transportAssignments: TransportAssignment[], vehicles: Vehicle[], drivers: Driver[], guests: Guest[]): ShuttleManifestRow[] {
  return buildShuttleManifest('Reception Shuttle', routes, transportAssignments, vehicles, drivers, guests);
}

export interface DepartureManifestRow {
  guestName: string;
  departureService?: string;
  requiredDepartureFromHotel?: string;
  vehicle?: string;
  driver?: string;
}

export function buildDepartureManifest(
  guests: Guest[],
  transportSegments: { guestId: string; direction: string; departureDate?: string; departureTime?: string; travelMode: string; carrier?: string; serviceNumber?: string }[],
  transportAssignments: TransportAssignment[],
  routes: TransportRoute[],
  vehicles: Vehicle[],
  drivers: Driver[],
): DepartureManifestRow[] {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const routeById = new Map(routes.map((r) => [r.id, r]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const driverById = new Map(drivers.map((d) => [d.id, d]));

  return transportSegments
    .filter((s) => s.direction === 'Departure')
    .map((segment) => {
      const assignment = transportAssignments.find((a) => a.guestId === segment.guestId);
      const route = assignment ? routeById.get(assignment.routeId) : undefined;
      const vehicle = route?.vehicleId ? vehicleById.get(route.vehicleId) : undefined;
      const driver = route?.driverId ? driverById.get(route.driverId) : undefined;
      return {
        guestName: guestById.get(segment.guestId)?.fullName ?? 'Unknown',
        departureService: [segment.travelMode, segment.carrier, segment.serviceNumber].filter(Boolean).join(' '),
        requiredDepartureFromHotel: assignment?.pickupTime,
        vehicle: vehicle?.name,
        driver: driver?.name,
      };
    });
}

export interface VipElderlyManifestRow {
  guestName: string;
  requirement: string;
  assignedHelper?: string;
  transport?: string;
  hotelDetails?: string;
}

export function buildVipElderlyManifest(
  guests: Guest[],
  operationalStatuses: GuestOperationalStatus[],
  transportAssignments: TransportAssignment[],
  routes: TransportRoute[],
  roomAssignments: RoomAssignment[],
  rooms: Room[],
  hotels: Hotel[],
  dutyAssignments: DutyAssignment[],
): VipElderlyManifestRow[] {
  const routeById = new Map(routes.map((r) => [r.id, r]));
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const hotelById = new Map(hotels.map((h) => [h.id, h]));
  const statusByGuestId = new Map(operationalStatuses.map((s) => [s.guestId, s]));
  const assistanceHelpers = dutyAssignments.filter((d) => d.role === 'Elderly Assistance' || d.role === 'Child Assistance').map((d) => d.personName);

  const flagged = guests.filter((g) => statusByGuestId.get(g.id)?.isVip || g.elderlyAssistanceRequired || g.accessibilityRequirements?.trim());

  return flagged.map((guest) => {
    const requirement = [
      statusByGuestId.get(guest.id)?.isVip && 'VIP',
      labelIf(guest.elderlyAssistanceRequired, 'Elderly assistance'),
      guest.accessibilityRequirements,
    ]
      .filter(Boolean)
      .join('; ');
    const assignment = transportAssignments.find((a) => a.guestId === guest.id);
    const route = assignment ? routeById.get(assignment.routeId) : undefined;
    const roomAssignment = roomAssignments.find((r) => r.guestId === guest.id);
    const room = roomAssignment ? roomById.get(roomAssignment.roomId) : undefined;
    const hotel = room ? hotelById.get(room.hotelId) : undefined;
    return {
      guestName: guest.fullName,
      requirement: requirement || 'VIP',
      assignedHelper: assistanceHelpers[0],
      transport: route?.name,
      hotelDetails: hotel ? `${hotel.name}${room ? ` — Room ${room.roomNumber}` : ''}` : undefined,
    };
  });
}

function labelIf(flag: boolean, label: string): string | undefined {
  return flag ? label : undefined;
}

export interface VendorContactManifestRow {
  vendorName: string;
  category: string;
  primaryContact?: string;
  backupContact?: string;
  arrivalTime?: string;
  location?: string;
  status?: string;
}

export function buildVendorContactManifest(vendors: Vendor[], vendorContacts: VendorContact[], vendorDayStatuses: VendorDayStatus[]): VendorContactManifestRow[] {
  const statusByVendorId = new Map(vendorDayStatuses.map((s) => [s.vendorId, s]));
  const contactById = new Map(vendorContacts.map((c) => [c.id, c]));
  return vendors.map((vendor) => {
    const status = statusByVendorId.get(vendor.id);
    const primaryContact = vendor.primaryContactId ? contactById.get(vendor.primaryContactId) : undefined;
    const backupContact = vendor.backupContactId ? contactById.get(vendor.backupContactId) : undefined;
    return {
      vendorName: vendor.name,
      category: vendor.category,
      primaryContact: primaryContact?.phone ?? vendor.phone,
      backupContact: backupContact?.phone,
      arrivalTime: status?.expectedArrivalTime,
      location: vendor.city,
      status: status?.status,
    };
  });
}

export interface FamilyDutyManifestRow {
  role: string;
  personName: string;
  phone?: string;
  shift?: string;
  location?: string;
}

export function buildFamilyDutyManifest(duties: DutyAssignment[]): FamilyDutyManifestRow[] {
  return duties.map((d) => ({
    role: d.role,
    personName: d.personName,
    phone: d.phone,
    shift: [d.startTime, d.endTime].filter(Boolean).join(' – ') || undefined,
    location: d.location,
  }));
}
