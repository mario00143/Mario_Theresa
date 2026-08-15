export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  standardOccupancy: number;
  extraBedAllowed: boolean;
  childCotAllowed: boolean;
  accessible: boolean;
  notes?: string;
}

export const ROOM_STATUSES = [
  'Available',
  'Reserved',
  'Assigned',
  'Checked In',
  'Checked Out',
  'Out of Service',
] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor?: string;
  /** Overrides the room type's capacity for this specific room, if set. */
  capacityOverride?: number;
  status: RoomStatus;
  notes?: string;
}
