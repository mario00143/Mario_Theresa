export const ROOM_ASSIGNMENT_STATUSES = ['Planned', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'] as const;
export type RoomAssignmentStatus = (typeof ROOM_ASSIGNMENT_STATUSES)[number];

/** A guest's stay in a specific room for a specific date range. A guest may hold several — one per date range if their stay is split. */
export interface RoomAssignment {
  id: string;
  roomId: string;
  guestId: string;
  householdId: string;
  checkInDate: string;
  checkOutDate: string;
  assignmentStatus: RoomAssignmentStatus;
  primaryOccupant: boolean;
  extraBedRequired: boolean;
  childCotRequired: boolean;
  accessibilityRequired: boolean;
  confirmationNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
