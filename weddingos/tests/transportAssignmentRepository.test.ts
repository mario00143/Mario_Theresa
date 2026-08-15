import { beforeEach, describe, expect, it } from 'vitest';
import {
  addTransportAssignment,
  deleteTransportAssignment,
  updateTransportAssignment,
  VehicleCapacityExceededError,
} from '@/data/repositories/transportAssignmentRepository';
import { addTransportRoute } from '@/data/repositories/transportRouteRepository';
import { addVehicle } from '@/data/repositories/vehicleRepository';
import { addDriver } from '@/data/repositories/driverRepository';
import { resetToDemoData, transportAssignmentsStore } from '@/data/stores';
import {
  findOverlappingRoutesForDriver,
  findOverlappingRoutesForVehicle,
  guestHasOverlappingRouteAssignments,
  routesOverlap,
  seatsAssignedForRoute,
} from '@/utils/transportLogic';
import { detectLogisticsIssues } from '@/utils/logisticsDataQuality';
import type { TransportRoute } from '@/types';

function setupRouteWithVehicle(capacity = 4) {
  const vehicle = addVehicle({
    name: 'Test Sedan', vehicleType: 'Sedan', passengerCapacity: capacity,
    airConditioned: true, status: 'Available', backupVehicle: false,
  });
  const route = addTransportRoute({
    name: 'Test Pickup Route', event: 'Wedding', routeType: 'Airport Pickup',
    origin: 'RGIA (Hyderabad Airport)', destination: 'Test Hotel', vehicleId: vehicle.id, status: 'Confirmed',
  });
  return { vehicle, route };
}

describe('transport assignment capacity enforcement (hard block)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('allows seat assignments up to the vehicle capacity', () => {
    const { route } = setupRouteWithVehicle(3);
    addTransportAssignment({ routeId: route.id, guestId: 'guest-a', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed' });
    addTransportAssignment({ routeId: route.id, guestId: 'guest-b', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' });
    expect(seatsAssignedForRoute(transportAssignmentsStore.get(), route.id)).toBe(3);
  });

  it('throws VehicleCapacityExceededError when assigned seats would exceed vehicle capacity', () => {
    const { route } = setupRouteWithVehicle(3);
    addTransportAssignment({ routeId: route.id, guestId: 'guest-a', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed' });

    expect(() =>
      addTransportAssignment({ routeId: route.id, guestId: 'guest-b', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed' }),
    ).toThrow(VehicleCapacityExceededError);

    // The over-capacity assignment must never be written.
    expect(seatsAssignedForRoute(transportAssignmentsStore.get(), route.id)).toBe(2);
  });

  it('does not enforce capacity for a route with no vehicle assigned yet', () => {
    const route = addTransportRoute({
      name: 'Unassigned Vehicle Route', event: 'Wedding', routeType: 'Airport Pickup',
      origin: 'RGIA (Hyderabad Airport)', destination: 'Test Hotel', status: 'Planned',
    });
    const assignment = addTransportAssignment({ routeId: route.id, guestId: 'guest-a', seatCount: 99, assistanceRequired: false, assignmentStatus: 'Planned' });
    expect(assignment.id).toBeTruthy();
  });

  it('ignores cancelled assignments when computing capacity', () => {
    const { route } = setupRouteWithVehicle(2);
    const first = addTransportAssignment({ routeId: route.id, guestId: 'guest-a', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed' });
    updateTransportAssignment(first.id, { assignmentStatus: 'Cancelled' });
    const second = addTransportAssignment({ routeId: route.id, guestId: 'guest-b', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed' });
    expect(second.id).toBeTruthy();
  });

  it('throws VehicleCapacityExceededError on update when increasing seat count past capacity', () => {
    const { route } = setupRouteWithVehicle(3);
    addTransportAssignment({ routeId: route.id, guestId: 'guest-a', seatCount: 2, assistanceRequired: false, assignmentStatus: 'Confirmed' });
    const second = addTransportAssignment({ routeId: route.id, guestId: 'guest-b', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' });

    expect(() => updateTransportAssignment(second.id, { seatCount: 2 })).toThrow(VehicleCapacityExceededError);
  });

  it('deletes a transport assignment', () => {
    const { route } = setupRouteWithVehicle(2);
    const assignment = addTransportAssignment({ routeId: route.id, guestId: 'guest-a', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' });
    deleteTransportAssignment(assignment.id);
    expect(transportAssignmentsStore.get().some((a) => a.id === assignment.id)).toBe(false);
  });
});

describe('pickup/drop unassigned and vehicle/driver linkage checks', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('flags a route with a vehicle but no driver', () => {
    const { route } = setupRouteWithVehicle(4);
    const issues = detectLogisticsIssues({
      households: [], guests: [], travelSegments: [], rooms: [], roomTypes: [], roomAssignments: [],
      vehicles: [], drivers: [], routes: [route], transportAssignments: [],
    });
    expect(issues.some((i) => i.category === 'route-no-driver' && i.linkId === route.id)).toBe(true);
  });

  it('flags a route with no vehicle assigned', () => {
    const route = addTransportRoute({
      name: 'No Vehicle Route', event: 'Wedding', routeType: 'Airport Pickup',
      origin: 'RGIA (Hyderabad Airport)', destination: 'Test Hotel', status: 'Planned',
    });
    const issues = detectLogisticsIssues({
      households: [], guests: [], travelSegments: [], rooms: [], roomTypes: [], roomAssignments: [],
      vehicles: [], drivers: [], routes: [route], transportAssignments: [],
    });
    expect(issues.some((i) => i.category === 'route-no-vehicle' && i.linkId === route.id)).toBe(true);
  });

  it('does not flag a fully staffed route', () => {
    const { route, vehicle } = setupRouteWithVehicle(4);
    const driver = addDriver({ name: 'Test Driver', phone: '9000000000', vehicleId: vehicle.id });
    const staffedRoute: TransportRoute = { ...route, driverId: driver.id };
    const issues = detectLogisticsIssues({
      households: [], guests: [], travelSegments: [], rooms: [], roomTypes: [], roomAssignments: [],
      vehicles: [vehicle], drivers: [driver], routes: [staffedRoute], transportAssignments: [],
    });
    expect(issues.some((i) => (i.category === 'route-no-driver' || i.category === 'route-no-vehicle') && i.linkId === route.id)).toBe(false);
  });
});

describe('overlapping route detection', () => {
  function makeRoute(overrides: Partial<TransportRoute> = {}): TransportRoute {
    return {
      id: overrides.id ?? 'route-1', name: 'Route', event: 'Wedding', routeType: 'Airport Pickup',
      origin: 'RGIA (Hyderabad Airport)', destination: 'Hotel', status: 'Confirmed',
      createdAt: '2026-07-01T00:00:00.000Z', updatedAt: '2026-07-01T00:00:00.000Z',
      ...overrides,
    };
  }

  it('flags two routes with the same planned date and near-identical times as overlapping', () => {
    const a = makeRoute({ id: 'r1', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:15' });
    expect(routesOverlap(a, b)).toBe(true);
  });

  it('does not flag routes more than 30 minutes apart', () => {
    const a = makeRoute({ id: 'r1', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '11:00' });
    expect(routesOverlap(a, b)).toBe(false);
  });

  it('flags a driver double-booked on two overlapping routes', () => {
    const driver = { id: 'driver-1', name: 'Test Driver', phone: '9000000000', createdAt: '', updatedAt: '' };
    const a = makeRoute({ id: 'r1', driverId: driver.id, plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', driverId: driver.id, plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:10' });
    const overlaps = findOverlappingRoutesForDriver(driver, [a, b]);
    expect(overlaps).toHaveLength(1);
  });

  it('does not flag a driver on two routes on different dates', () => {
    const driver = { id: 'driver-1', name: 'Test Driver', phone: '9000000000', createdAt: '', updatedAt: '' };
    const a = makeRoute({ id: 'r1', driverId: driver.id, plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', driverId: driver.id, plannedDepartureDate: '2027-01-29', plannedDepartureTime: '10:00' });
    expect(findOverlappingRoutesForDriver(driver, [a, b])).toHaveLength(0);
  });

  it('flags a vehicle double-booked on two overlapping routes', () => {
    const vehicle = { id: 'vehicle-1', name: 'Test Vehicle', vehicleType: 'Sedan' as const, passengerCapacity: 4, airConditioned: true, status: 'Assigned' as const, backupVehicle: false, createdAt: '', updatedAt: '' };
    const a = makeRoute({ id: 'r1', vehicleId: vehicle.id, plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', vehicleId: vehicle.id, plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:05' });
    expect(findOverlappingRoutesForVehicle(vehicle, [a, b])).toHaveLength(1);
  });

  it('flags a guest assigned to two overlapping routes', () => {
    const a = makeRoute({ id: 'r1', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:10' });
    const assignments = [
      { id: 'ta1', routeId: 'r1', guestId: 'guest-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' as const, createdAt: '', updatedAt: '' },
      { id: 'ta2', routeId: 'r2', guestId: 'guest-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' as const, createdAt: '', updatedAt: '' },
    ];
    expect(guestHasOverlappingRouteAssignments('guest-1', assignments, [a, b])).toBe(true);
  });

  it('does not flag a guest assigned to two non-overlapping routes', () => {
    const a = makeRoute({ id: 'r1', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '10:00' });
    const b = makeRoute({ id: 'r2', plannedDepartureDate: '2027-01-31', plannedDepartureTime: '10:00' });
    const assignments = [
      { id: 'ta1', routeId: 'r1', guestId: 'guest-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' as const, createdAt: '', updatedAt: '' },
      { id: 'ta2', routeId: 'r2', guestId: 'guest-1', seatCount: 1, assistanceRequired: false, assignmentStatus: 'Confirmed' as const, createdAt: '', updatedAt: '' },
    ];
    expect(guestHasOverlappingRouteAssignments('guest-1', assignments, [a, b])).toBe(false);
  });
});
