import type { Driver, TransportAssignment, TransportRoute, Vehicle } from '@/types';
import { parseDate } from './date';

const NON_ACTIVE_ASSIGNMENT_STATUSES: TransportAssignment['assignmentStatus'][] = ['Cancelled', 'No Show'];

export function isTransportAssignmentActive(assignment: TransportAssignment): boolean {
  return !NON_ACTIVE_ASSIGNMENT_STATUSES.includes(assignment.assignmentStatus);
}

/** Total seats currently assigned (active statuses only) on a route, optionally excluding one assignment (for edit-in-place checks). */
export function seatsAssignedForRoute(assignments: TransportAssignment[], routeId: string, excludeAssignmentId?: string): number {
  return assignments
    .filter((a) => a.routeId === routeId && a.id !== excludeAssignmentId && isTransportAssignmentActive(a))
    .reduce((sum, a) => sum + a.seatCount, 0);
}

export function luggageAssignedForRoute(assignments: TransportAssignment[], routeId: string): number {
  return assignments
    .filter((a) => a.routeId === routeId && isTransportAssignmentActive(a))
    .reduce((sum, a) => sum + (a.luggageCount ?? 0), 0);
}

export interface VehicleUtilization {
  vehicle: Vehicle;
  routes: TransportRoute[];
  assignedSeats: number;
  remainingSeats: number;
}

export function computeVehicleUtilization(
  vehicle: Vehicle,
  routes: TransportRoute[],
  assignments: TransportAssignment[],
): VehicleUtilization {
  const vehicleRoutes = routes.filter((r) => r.vehicleId === vehicle.id);
  const assignedSeats = vehicleRoutes.reduce((sum, route) => sum + seatsAssignedForRoute(assignments, route.id), 0);
  return {
    vehicle,
    routes: vehicleRoutes,
    assignedSeats,
    remainingSeats: Math.max(0, vehicle.passengerCapacity - assignedSeats),
  };
}

function routeDateTime(route: TransportRoute): Date | null {
  if (!route.plannedDepartureDate) return null;
  return parseDate(`${route.plannedDepartureDate}T${route.plannedDepartureTime ?? '00:00'}`);
}

/** Two routes "overlap" if they share the same planned departure date and their times are within 30 minutes of each other — used to flag a driver/vehicle double-booked. */
export function routesOverlap(a: TransportRoute, b: TransportRoute, windowMinutes = 30): boolean {
  const aTime = routeDateTime(a);
  const bTime = routeDateTime(b);
  if (!aTime || !bTime) return false;
  const diffMinutes = Math.abs(aTime.getTime() - bTime.getTime()) / 60000;
  return diffMinutes < windowMinutes;
}

export function findOverlappingRoutesForDriver(driver: Driver, routes: TransportRoute[]): TransportRoute[][] {
  const driverRoutes = routes.filter((r) => r.driverId === driver.id);
  return findOverlappingPairs(driverRoutes);
}

export function findOverlappingRoutesForVehicle(vehicle: Vehicle, routes: TransportRoute[]): TransportRoute[][] {
  const vehicleRoutes = routes.filter((r) => r.vehicleId === vehicle.id);
  return findOverlappingPairs(vehicleRoutes);
}

function findOverlappingPairs(routes: TransportRoute[]): TransportRoute[][] {
  const pairs: TransportRoute[][] = [];
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      if (routesOverlap(routes[i], routes[j])) pairs.push([routes[i], routes[j]]);
    }
  }
  return pairs;
}

/** True if the guest holds two active assignments on different routes whose routes overlap in time. */
export function guestHasOverlappingRouteAssignments(
  guestId: string,
  assignments: TransportAssignment[],
  routes: TransportRoute[],
): boolean {
  const guestAssignments = assignments.filter((a) => a.guestId === guestId && isTransportAssignmentActive(a));
  const routeById = new Map(routes.map((r) => [r.id, r]));
  for (let i = 0; i < guestAssignments.length; i++) {
    for (let j = i + 1; j < guestAssignments.length; j++) {
      if (guestAssignments[i].routeId === guestAssignments[j].routeId) continue;
      const routeA = routeById.get(guestAssignments[i].routeId);
      const routeB = routeById.get(guestAssignments[j].routeId);
      if (routeA && routeB && routesOverlap(routeA, routeB)) return true;
    }
  }
  return false;
}
