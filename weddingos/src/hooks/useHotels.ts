import { useCallback } from 'react';
import type { Hotel } from '@/types';
import { hotelsStore } from '@/data/stores';
import { addHotel, deleteHotel, updateHotel, type NewHotelInput } from '@/data/repositories/hotelRepository';
import { useStoreValue } from './useStore';

export function useHotels() {
  const hotels = useStoreValue(hotelsStore);

  return {
    hotels,
    addHotel: useCallback((input: NewHotelInput) => addHotel(input), []),
    updateHotel: useCallback((id: string, patch: Partial<Omit<Hotel, 'id' | 'createdAt'>>) => updateHotel(id, patch), []),
    deleteHotel: useCallback((id: string) => deleteHotel(id), []),
  };
}

export function useHotel(id: string | undefined): Hotel | undefined {
  const hotels = useStoreValue(hotelsStore);
  return id ? hotels.find((h) => h.id === id) : undefined;
}
