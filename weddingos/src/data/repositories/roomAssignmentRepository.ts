import type { RoomAssignment } from '@/types';
import { generateId } from '@/lib/id';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import { roomAssignmentsStore, roomsStore, roomTypesStore } from '../stores';
import { getRoomCapacity, occupantsOverlapping, roomAssignmentsOverlap } from '@/utils/roomLogic';

export type NewRoomAssignmentInput = Omit<RoomAssignment, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export class RoomCapacityExceededError extends Error {
  roomId: string;
  capacity: number;
  attemptedOccupants: number;

  constructor(roomId: string, capacity: number, attemptedOccupants: number) {
    super(`This room's capacity is ${capacity}, but this assignment would bring it to ${attemptedOccupants} occupant(s).`);
    this.name = 'RoomCapacityExceededError';
    this.roomId = roomId;
    this.capacity = capacity;
    this.attemptedOccupants = attemptedOccupants;
  }
}

export class OverlappingRoomAssignmentError extends Error {
  guestId: string;

  constructor(guestId: string) {
    super('This guest already has a room assignment overlapping these dates.');
    this.name = 'OverlappingRoomAssignmentError';
    this.guestId = guestId;
  }
}

/**
 * Adds a room assignment after enforcing the two hard rules from Phase 3
 * section 13: never let active occupants exceed room capacity, and never
 * let the same guest hold two overlapping assignments. Both throw a typed
 * error the UI can catch and display — callers must not bypass this by
 * writing to the store directly.
 */
export function addRoomAssignment(input: NewRoomAssignmentInput): RoomAssignment {
  const rooms = roomsStore.get();
  const roomTypes = roomTypesStore.get();
  const existing = roomAssignmentsStore.get();
  const room = rooms.find((r) => r.id === input.roomId);

  if (roomAssignmentsOverlap(existing, input.guestId, input.checkInDate, input.checkOutDate)) {
    throw new OverlappingRoomAssignmentError(input.guestId);
  }

  if (room) {
    const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);
    const capacity = getRoomCapacity(room, roomType);
    const currentOccupants = occupantsOverlapping(existing, input.roomId, input.checkInDate, input.checkOutDate);
    if (currentOccupants + 1 > capacity) {
      throw new RoomCapacityExceededError(input.roomId, capacity, currentOccupants + 1);
    }
  }

  const timestamp = nowISO();
  const assignment: RoomAssignment = { ...input, id: generateId('roomassign'), createdAt: timestamp, updatedAt: timestamp };
  roomAssignmentsStore.set((prev) => [...prev, assignment]);
  logAuditAction({ action: 'roomAssignment.create', entityType: 'RoomAssignment', entityId: assignment.id, summary: `Assigned guest ${assignment.guestId} to room ${assignment.roomId}` });
  return assignment;
}

/** Updates an assignment. Re-checks capacity/overlap only when the room or dates actually change. */
export function updateRoomAssignment(id: string, patch: Partial<Omit<RoomAssignment, 'id' | 'createdAt'>>): void {
  const existing = roomAssignmentsStore.get();
  const current = existing.find((a) => a.id === id);
  if (!current) return;

  const nextRoomId = patch.roomId ?? current.roomId;
  const nextCheckIn = patch.checkInDate ?? current.checkInDate;
  const nextCheckOut = patch.checkOutDate ?? current.checkOutDate;
  const nextGuestId = patch.guestId ?? current.guestId;

  const roomOrDatesChanged = nextRoomId !== current.roomId || nextCheckIn !== current.checkInDate || nextCheckOut !== current.checkOutDate;
  if (roomOrDatesChanged) {
    if (roomAssignmentsOverlap(existing, nextGuestId, nextCheckIn, nextCheckOut, id)) {
      throw new OverlappingRoomAssignmentError(nextGuestId);
    }
    const room = roomsStore.get().find((r) => r.id === nextRoomId);
    if (room) {
      const roomType = roomTypesStore.get().find((rt) => rt.id === room.roomTypeId);
      const capacity = getRoomCapacity(room, roomType);
      const currentOccupants = occupantsOverlapping(existing, nextRoomId, nextCheckIn, nextCheckOut, id);
      if (currentOccupants + 1 > capacity) {
        throw new RoomCapacityExceededError(nextRoomId, capacity, currentOccupants + 1);
      }
    }
  }

  roomAssignmentsStore.set((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowISO() } : a)));
  logAuditAction({ action: 'roomAssignment.update', entityType: 'RoomAssignment', entityId: id, summary: `Updated room assignment ${id}` });
}

export function deleteRoomAssignment(id: string): void {
  roomAssignmentsStore.set((prev) => prev.filter((a) => a.id !== id));
  logAuditAction({ action: 'roomAssignment.delete', entityType: 'RoomAssignment', entityId: id, summary: `Deleted room assignment ${id}` });
}
