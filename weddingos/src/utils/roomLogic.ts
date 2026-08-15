import type { Guest, Room, RoomAssignment, RoomType } from '@/types';
import { parseDate } from './date';

const NON_OCCUPYING_STATUSES: RoomAssignment['assignmentStatus'][] = ['Cancelled'];

export function isRoomAssignmentActive(assignment: RoomAssignment): boolean {
  return !NON_OCCUPYING_STATUSES.includes(assignment.assignmentStatus);
}

export function getRoomCapacity(room: Room | undefined, roomType: RoomType | undefined): number {
  if (!room) return 0;
  return room.capacityOverride ?? roomType?.capacity ?? 0;
}

/** Half-open interval overlap check: [aStart, aEnd) intersects [bStart, bEnd). */
export function dateRangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const aS = parseDate(aStart);
  const aE = parseDate(aEnd);
  const bS = parseDate(bStart);
  const bE = parseDate(bEnd);
  if (!aS || !aE || !bS || !bE) return false;
  return aS.getTime() < bE.getTime() && bS.getTime() < aE.getTime();
}

/** Count of active (non-cancelled) occupants in a room whose stay overlaps the given date range. */
export function occupantsOverlapping(
  assignments: RoomAssignment[],
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeAssignmentId?: string,
): number {
  return assignments.filter(
    (a) =>
      a.roomId === roomId &&
      a.id !== excludeAssignmentId &&
      isRoomAssignmentActive(a) &&
      dateRangesOverlap(a.checkInDate, a.checkOutDate, checkInDate, checkOutDate),
  ).length;
}

/** True if the guest already holds an active assignment (in any room) overlapping the given date range. */
export function roomAssignmentsOverlap(
  assignments: RoomAssignment[],
  guestId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeAssignmentId?: string,
): boolean {
  return assignments.some(
    (a) =>
      a.guestId === guestId &&
      a.id !== excludeAssignmentId &&
      isRoomAssignmentActive(a) &&
      dateRangesOverlap(a.checkInDate, a.checkOutDate, checkInDate, checkOutDate),
  );
}

export interface RoomOccupancy {
  room: Room;
  roomType: RoomType | undefined;
  capacity: number;
  occupantAssignments: RoomAssignment[];
  occupantCount: number;
  availableSpaces: number;
}

/** Current/active occupancy snapshot for a room (does not filter by date — "who is/was ever assigned here and still active"). */
export function computeRoomOccupancy(room: Room, roomType: RoomType | undefined, assignments: RoomAssignment[]): RoomOccupancy {
  const occupantAssignments = assignments.filter((a) => a.roomId === room.id && isRoomAssignmentActive(a));
  const capacity = getRoomCapacity(room, roomType);
  return {
    room,
    roomType,
    capacity,
    occupantAssignments,
    occupantCount: occupantAssignments.length,
    availableSpaces: Math.max(0, capacity - occupantAssignments.length),
  };
}

export interface RoomAssignmentWarning {
  field: string;
  message: string;
}

/** Non-blocking warnings for a single room assignment — real exceptions can exist, so these never block saving. */
export function validateRoomAssignment(
  assignment: Pick<RoomAssignment, 'checkInDate' | 'checkOutDate' | 'extraBedRequired' | 'childCotRequired' | 'accessibilityRequired'>,
  context: { guest?: Guest; roomType?: RoomType },
): RoomAssignmentWarning[] {
  const warnings: RoomAssignmentWarning[] = [];
  const checkIn = parseDate(assignment.checkInDate);
  const checkOut = parseDate(assignment.checkOutDate);

  if (checkIn && checkOut && checkIn.getTime() > checkOut.getTime()) {
    warnings.push({ field: 'checkOutDate', message: 'Check-in date is after check-out date.' });
  }

  if (context.guest && !context.guest.accommodationRequired) {
    warnings.push({ field: 'guestId', message: 'This guest has not requested accommodation.' });
  }

  if (assignment.accessibilityRequired && context.roomType && !context.roomType.accessible) {
    warnings.push({ field: 'accessibilityRequired', message: 'Accessibility is required but the assigned room type is not marked accessible.' });
  }
  if (assignment.childCotRequired && context.roomType && !context.roomType.childCotAllowed) {
    warnings.push({ field: 'childCotRequired', message: 'A child cot was requested but this room type does not allow one.' });
  }
  if (assignment.extraBedRequired && context.roomType && !context.roomType.extraBedAllowed) {
    warnings.push({ field: 'extraBedRequired', message: 'An extra bed was requested but this room type does not allow one.' });
  }

  return warnings;
}
