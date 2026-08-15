import { useCallback } from 'react';
import type { Room, RoomType } from '@/types';
import { roomTypesStore, roomsStore } from '@/data/stores';
import {
  addRoom,
  addRoomType,
  deleteRoom,
  deleteRoomType,
  updateRoom,
  updateRoomType,
  type NewRoomInput,
  type NewRoomTypeInput,
} from '@/data/repositories/roomRepository';
import { useStoreValue } from './useStore';

export function useRoomTypes() {
  const roomTypes = useStoreValue(roomTypesStore);

  return {
    roomTypes,
    addRoomType: useCallback((input: NewRoomTypeInput) => addRoomType(input), []),
    updateRoomType: useCallback((id: string, patch: Partial<Omit<RoomType, 'id'>>) => updateRoomType(id, patch), []),
    deleteRoomType: useCallback((id: string) => deleteRoomType(id), []),
  };
}

export function useRooms() {
  const rooms = useStoreValue(roomsStore);

  return {
    rooms,
    addRoom: useCallback((input: NewRoomInput) => addRoom(input), []),
    updateRoom: useCallback((id: string, patch: Partial<Omit<Room, 'id'>>) => updateRoom(id, patch), []),
    deleteRoom: useCallback((id: string) => deleteRoom(id), []),
  };
}

export function useRoomTypesForHotel(hotelId: string | undefined): RoomType[] {
  const roomTypes = useStoreValue(roomTypesStore);
  return hotelId ? roomTypes.filter((rt) => rt.hotelId === hotelId) : [];
}

export function useRoomsForHotel(hotelId: string | undefined): Room[] {
  const rooms = useStoreValue(roomsStore);
  return hotelId ? rooms.filter((r) => r.hotelId === hotelId) : [];
}
