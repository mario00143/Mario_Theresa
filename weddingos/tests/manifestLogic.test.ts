import { describe, expect, it } from 'vitest';
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
import {
  buildChurchShuttleManifest,
  buildDepartureManifest,
  buildFamilyDutyManifest,
  buildGuestArrivalManifest,
  buildHotelRoomingManifest,
  buildReceptionShuttleManifest,
  buildVendorContactManifest,
  buildVipElderlyManifest,
} from '@/utils/manifestLogic';

function guest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'guest-1',
    householdId: 'household-1',
    fullName: 'Test Guest',
    ageCategory: 'Adult',
    invitedEvents: ['Wedding'],
    rsvpResponses: [],
    dietaryPreference: 'Not Specified',
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

function household(overrides: Partial<Household> = {}): Household {
  return {
    id: 'household-1',
    householdName: 'Test Household',
    primaryContactName: 'Test Contact',
    primaryPhone: '+91 90000 00001',
    side: 'Groom',
    relationshipCategory: 'Friend',
    city: 'Hyderabad',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Sent',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function route(overrides: Partial<TransportRoute> = {}): TransportRoute {
  return {
    id: 'route-1',
    name: 'Church Shuttle',
    event: 'Wedding',
    routeType: 'Church Shuttle',
    origin: 'Hotel',
    destination: 'Church',
    status: 'Planned',
    plannedDepartureTime: '07:30',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function assignment(overrides: Partial<TransportAssignment> = {}): TransportAssignment {
  return {
    id: 'assign-1',
    routeId: 'route-1',
    guestId: 'guest-1',
    seatCount: 1,
    assistanceRequired: false,
    assignmentStatus: 'Confirmed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'vehicle-1',
    name: 'Mini Bus',
    vehicleType: 'Mini Bus',
    passengerCapacity: 20,
    airConditioned: true,
    status: 'Assigned',
    backupVehicle: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function driver(overrides: Partial<Driver> = {}): Driver {
  return {
    id: 'driver-1',
    name: 'Test Driver',
    phone: '+91 90000 00002',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: 'hotel-1',
    name: 'Test Hotel',
    area: 'Banjara Hills',
    city: 'Hyderabad',
    breakfastIncluded: true,
    parkingAvailable: true,
    busAccess: true,
    accessibleRoomsAvailable: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function room(overrides: Partial<Room> = {}): Room {
  return { id: 'room-1', hotelId: 'hotel-1', roomTypeId: 'roomtype-1', roomNumber: '101', status: 'Assigned', ...overrides };
}

function roomAssignment(overrides: Partial<RoomAssignment> = {}): RoomAssignment {
  return {
    id: 'ra-1',
    roomId: 'room-1',
    guestId: 'guest-1',
    householdId: 'household-1',
    checkInDate: '2027-01-29',
    checkOutDate: '2027-01-31',
    assignmentStatus: 'Confirmed',
    primaryOccupant: true,
    extraBedRequired: false,
    childCotRequired: false,
    accessibilityRequired: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function operationalStatus(overrides: Partial<GuestOperationalStatus> = {}): GuestOperationalStatus {
  return {
    id: 'gos-1',
    guestId: 'guest-1',
    state: 'Expected',
    isVip: false,
    lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function duty(overrides: Partial<DutyAssignment> = {}): DutyAssignment {
  return {
    id: 'duty-1',
    role: 'Other',
    personName: 'Test Person',
    status: 'Planned',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function vendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: 'vendor-1',
    name: 'Test Vendor',
    category: 'Catering',
    status: 'Confirmed',
    event: 'Wedding',
    gstApplicable: false,
    finalPrimaryContactConfirmed: false,
    finalBackupContactConfirmed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function vendorContact(overrides: Partial<VendorContact> = {}): VendorContact {
  return {
    id: 'contact-1',
    vendorId: 'vendor-1',
    name: 'Test Contact',
    preferredContactMethod: 'Phone',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function vendorDayStatus(overrides: Partial<VendorDayStatus> = {}): VendorDayStatus {
  return {
    id: 'vds-1',
    vendorId: 'vendor-1',
    primaryContactConfirmed: false,
    setupComplete: false,
    serviceReady: false,
    finalSettlementChecked: false,
    status: 'Expected',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildGuestArrivalManifest (section 21)', () => {
  it('includes only guests with a transport assignment, joining route/vehicle/driver/room/hotel', () => {
    const rows = buildGuestArrivalManifest(
      [guest({ id: 'assigned' }), guest({ id: 'unassigned' })],
      [household()],
      [assignment({ guestId: 'assigned', pickupTime: '07:15', pickupLocation: 'Lobby' })],
      [route({ vehicleId: 'vehicle-1', driverId: 'driver-1' })],
      [vehicle()],
      [driver()],
      [roomAssignment({ guestId: 'assigned' })],
      [room()],
      [hotel()],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].guestName).toBe('Test Guest');
    expect(rows[0].vehicle).toBe('Mini Bus');
    expect(rows[0].driver).toBe('Test Driver');
    expect(rows[0].hotel).toBe('Test Hotel');
    expect(rows[0].room).toBe('101');
  });
});

describe('buildHotelRoomingManifest (section 21)', () => {
  it('groups multiple guests sharing a room and flags special needs', () => {
    const rows = buildHotelRoomingManifest(
      [
        roomAssignment({ id: 'ra1', guestId: 'g1', extraBedRequired: true }),
        roomAssignment({ id: 'ra2', guestId: 'g2', primaryOccupant: false }),
      ],
      [room()],
      [hotel()],
      [guest({ id: 'g1', fullName: 'Guest One' }), guest({ id: 'g2', fullName: 'Guest Two' })],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].guestNames.sort()).toEqual(['Guest One', 'Guest Two']);
    expect(rows[0].specialNeeds).toContain('Extra bed');
  });
});

describe('buildChurchShuttleManifest / buildReceptionShuttleManifest (section 21)', () => {
  it('filters routes by the correct route type', () => {
    const routes = [route({ id: 'church', routeType: 'Church Shuttle' }), route({ id: 'reception', routeType: 'Reception Shuttle' })];
    expect(buildChurchShuttleManifest(routes, [], [], [], []).map((r) => r.routeName)).toEqual(['Church Shuttle']);
    expect(buildReceptionShuttleManifest(routes, [], [], [], []).map((r) => r.routeName)).toEqual(['Church Shuttle']);
  });

  it('includes assigned guest names on the matching route', () => {
    const rows = buildChurchShuttleManifest(
      [route({ id: 'church', routeType: 'Church Shuttle' })],
      [assignment({ routeId: 'church', guestId: 'g1' })],
      [],
      [],
      [guest({ id: 'g1', fullName: 'Guest One' })],
    );
    expect(rows[0].guestNames).toEqual(['Guest One']);
  });
});

describe('buildDepartureManifest (section 21)', () => {
  it('includes only Departure-direction segments', () => {
    const rows = buildDepartureManifest(
      [guest({ id: 'g1', fullName: 'Guest One' })],
      [
        { guestId: 'g1', direction: 'Departure', travelMode: 'Flight', carrier: 'IndiGo', serviceNumber: '6E123' },
        { guestId: 'g1', direction: 'Arrival', travelMode: 'Flight' },
      ],
      [],
      [],
      [],
      [],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].departureService).toContain('IndiGo');
  });
});

describe('buildVipElderlyManifest (section 21)', () => {
  it('flags a guest via GuestOperationalStatus.isVip', () => {
    const rows = buildVipElderlyManifest(
      [guest({ id: 'g1', fullName: 'VIP Guest' })],
      [operationalStatus({ guestId: 'g1', isVip: true })],
      [],
      [],
      [],
      [],
      [],
      [],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].requirement).toContain('VIP');
  });

  it('flags a guest via elderlyAssistanceRequired without needing an operational status', () => {
    const rows = buildVipElderlyManifest([guest({ id: 'g1', elderlyAssistanceRequired: true })], [], [], [], [], [], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0].requirement).toContain('Elderly assistance');
  });

  it('flags a guest via accessibilityRequirements text', () => {
    const rows = buildVipElderlyManifest([guest({ id: 'g1', accessibilityRequirements: 'Wheelchair access' })], [], [], [], [], [], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0].requirement).toContain('Wheelchair access');
  });

  it('excludes a guest with none of the VIP/elderly/accessibility flags', () => {
    const rows = buildVipElderlyManifest([guest({ id: 'g1' })], [], [], [], [], [], [], []);
    expect(rows).toEqual([]);
  });

  it('surfaces an assigned Elderly Assistance or Child Assistance duty as the helper', () => {
    const rows = buildVipElderlyManifest(
      [guest({ id: 'g1', elderlyAssistanceRequired: true })],
      [],
      [],
      [],
      [],
      [],
      [],
      [duty({ role: 'Elderly Assistance', personName: 'Helper Person' })],
    );
    expect(rows[0].assignedHelper).toBe('Helper Person');
  });
});

describe('buildVendorContactManifest (section 21)', () => {
  it('resolves primary/backup contact phone via Vendor.primaryContactId/backupContactId', () => {
    const rows = buildVendorContactManifest(
      [vendor({ primaryContactId: 'c1', backupContactId: 'c2' })],
      [vendorContact({ id: 'c1', phone: '+91 90000 11111' }), vendorContact({ id: 'c2', phone: '+91 90000 22222' })],
      [vendorDayStatus({ status: 'Ready' })],
    );
    expect(rows[0].primaryContact).toBe('+91 90000 11111');
    expect(rows[0].backupContact).toBe('+91 90000 22222');
    expect(rows[0].status).toBe('Ready');
  });

  it('falls back to the vendor phone when no primary contact is linked', () => {
    const rows = buildVendorContactManifest([vendor({ phone: '+91 90000 99999' })], [], []);
    expect(rows[0].primaryContact).toBe('+91 90000 99999');
  });
});

describe('buildFamilyDutyManifest (section 21)', () => {
  it('maps duty assignments to manifest rows with a formatted shift', () => {
    const rows = buildFamilyDutyManifest([duty({ role: 'Church Lead', personName: 'Test Person', startTime: '08:00', endTime: '12:00' })]);
    expect(rows[0].role).toBe('Church Lead');
    expect(rows[0].shift).toBe('08:00 – 12:00');
  });
});
