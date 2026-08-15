import type { Room, RoomType } from '@/types';
import { generateId } from '@/lib/id';
import { roomAssignmentsStore, roomsStore, roomTypesStore } from '../stores';

export type NewRoomTypeInput = Omit<RoomType, 'id'>;
export type NewRoomInput = Omit<Room, 'id'>;

export function addRoomType(input: NewRoomTypeInput): RoomType {
  const roomType: RoomType = { ...input, id: generateId('roomtype') };
  roomTypesStore.set((prev) => [...prev, roomType]);
  return roomType;
}

export function updateRoomType(id: string, patch: Partial<Omit<RoomType, 'id'>>): void {
  roomTypesStore.set((prev) => prev.map((rt) => (rt.id === id ? { ...rt, ...patch } : rt)));
}

/** Deletes a room type and cascades: its rooms, and any assignments in those rooms, are removed too. */
export function deleteRoomType(id: string): void {
  const roomIds = new Set(roomsStore.get().filter((r) => r.roomTypeId === id).map((r) => r.id));
  roomTypesStore.set((prev) => prev.filter((rt) => rt.id !== id));
  roomsStore.set((prev) => prev.filter((r) => r.roomTypeId !== id));
  roomAssignmentsStore.set((prev) => prev.filter((ra) => !roomIds.has(ra.roomId)));
}

export function addRoom(input: NewRoomInput): Room {
  const room: Room = { ...input, id: generateId('room') };
  roomsStore.set((prev) => [...prev, room]);
  return room;
}

export function updateRoom(id: string, patch: Partial<Omit<Room, 'id'>>): void {
  roomsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

/** Deletes a room and cascades: any assignments in that room are removed too. */
export function deleteRoom(id: string): void {
  roomsStore.set((prev) => prev.filter((r) => r.id !== id));
  roomAssignmentsStore.set((prev) => prev.filter((ra) => ra.roomId !== id));
}
