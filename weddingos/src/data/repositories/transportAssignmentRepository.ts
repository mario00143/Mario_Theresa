import type { TransportAssignment } from '@/types';
import { generateId } from '@/lib/id';
import { transportAssignmentsStore, transportRoutesStore, vehiclesStore } from '../stores';
import { seatsAssignedForRoute } from '@/utils/transportLogic';

export type NewTransportAssignmentInput = Omit<TransportAssignment, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export class VehicleCapacityExceededError extends Error {
  routeId: string;
  capacity: number;
  attemptedSeats: number;

  constructor(routeId: string, capacity: number, attemptedSeats: number) {
    super(`This vehicle seats ${capacity}, but this assignment would bring the route to ${attemptedSeats} seat(s) assigned.`);
    this.name = 'VehicleCapacityExceededError';
    this.routeId = routeId;
    this.capacity = capacity;
    this.attemptedSeats = attemptedSeats;
  }
}

const ACTIVE_ASSIGNMENT_STATUSES: TransportAssignment['assignmentStatus'][] = ['Planned', 'Confirmed', 'Boarded'];

/** Adds a transport assignment after enforcing that assigned seats never exceed the route's vehicle capacity. */
export function addTransportAssignment(input: NewTransportAssignmentInput): TransportAssignment {
  const route = transportRoutesStore.get().find((r) => r.id === input.routeId);
  if (route?.vehicleId && ACTIVE_ASSIGNMENT_STATUSES.includes(input.assignmentStatus)) {
    const vehicle = vehiclesStore.get().find((v) => v.id === route.vehicleId);
    if (vehicle) {
      const currentSeats = seatsAssignedForRoute(transportAssignmentsStore.get(), input.routeId);
      const attemptedSeats = currentSeats + input.seatCount;
      if (attemptedSeats > vehicle.passengerCapacity) {
        throw new VehicleCapacityExceededError(input.routeId, vehicle.passengerCapacity, attemptedSeats);
      }
    }
  }

  const timestamp = nowISO();
  const assignment: TransportAssignment = { ...input, id: generateId('transportassign'), createdAt: timestamp, updatedAt: timestamp };
  transportAssignmentsStore.set((prev) => [...prev, assignment]);
  return assignment;
}

export function updateTransportAssignment(id: string, patch: Partial<Omit<TransportAssignment, 'id' | 'createdAt'>>): void {
  const existing = transportAssignmentsStore.get();
  const current = existing.find((a) => a.id === id);
  if (!current) return;

  const nextRouteId = patch.routeId ?? current.routeId;
  const nextSeatCount = patch.seatCount ?? current.seatCount;
  const nextStatus = patch.assignmentStatus ?? current.assignmentStatus;

  if (ACTIVE_ASSIGNMENT_STATUSES.includes(nextStatus)) {
    const route = transportRoutesStore.get().find((r) => r.id === nextRouteId);
    if (route?.vehicleId) {
      const vehicle = vehiclesStore.get().find((v) => v.id === route.vehicleId);
      if (vehicle) {
        const currentSeats = seatsAssignedForRoute(existing, nextRouteId, id);
        const attemptedSeats = currentSeats + nextSeatCount;
        if (attemptedSeats > vehicle.passengerCapacity) {
          throw new VehicleCapacityExceededError(nextRouteId, vehicle.passengerCapacity, attemptedSeats);
        }
      }
    }
  }

  transportAssignmentsStore.set((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowISO() } : a)));
}

export function deleteTransportAssignment(id: string): void {
  transportAssignmentsStore.set((prev) => prev.filter((a) => a.id !== id));
}
