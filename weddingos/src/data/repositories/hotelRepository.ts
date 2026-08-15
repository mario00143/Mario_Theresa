import type { Hotel } from '@/types';
import { generateId } from '@/lib/id';
import { hotelsStore, roomAssignmentsStore, roomsStore, roomTypesStore } from '../stores';

export type NewHotelInput = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addHotel(input: NewHotelInput): Hotel {
  const timestamp = nowISO();
  const hotel: Hotel = {
    ...input,
    id: generateId('hotel'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  hotelsStore.set((prev) => [...prev, hotel]);
  return hotel;
}

export function updateHotel(id: string, patch: Partial<Omit<Hotel, 'id' | 'createdAt'>>): void {
  hotelsStore.set((prev) => prev.map((hotel) => (hotel.id === id ? { ...hotel, ...patch, updatedAt: nowISO() } : hotel)));
}

/** Deletes a hotel and cascades: its room types, rooms, and any room assignments in those rooms are removed too. */
export function deleteHotel(id: string): void {
  const roomIdsAtHotel = new Set(roomsStore.get().filter((r) => r.hotelId === id).map((r) => r.id));
  hotelsStore.set((prev) => prev.filter((hotel) => hotel.id !== id));
  roomTypesStore.set((prev) => prev.filter((rt) => rt.hotelId !== id));
  roomsStore.set((prev) => prev.filter((r) => r.hotelId !== id));
  roomAssignmentsStore.set((prev) => prev.filter((ra) => !roomIdsAtHotel.has(ra.roomId)));
}
