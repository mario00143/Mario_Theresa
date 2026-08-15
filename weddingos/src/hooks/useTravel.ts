import { useCallback } from 'react';
import type { TravelSegment } from '@/types';
import { travelSegmentsStore } from '@/data/stores';
import {
  addTravelSegment,
  deleteTravelSegment,
  duplicateTravelSegment,
  updateTravelSegment,
  type NewTravelSegmentInput,
} from '@/data/repositories/travelRepository';
import { useStoreValue } from './useStore';

export function useTravel() {
  const travelSegments = useStoreValue(travelSegmentsStore);

  return {
    travelSegments,
    addTravelSegment: useCallback((input: NewTravelSegmentInput) => addTravelSegment(input), []),
    updateTravelSegment: useCallback(
      (id: string, patch: Partial<Omit<TravelSegment, 'id' | 'createdAt'>>) => updateTravelSegment(id, patch),
      [],
    ),
    deleteTravelSegment: useCallback((id: string) => deleteTravelSegment(id), []),
    duplicateTravelSegment: useCallback((id: string) => duplicateTravelSegment(id), []),
  };
}

export function useTravelSegment(id: string | undefined): TravelSegment | undefined {
  const travelSegments = useStoreValue(travelSegmentsStore);
  return id ? travelSegments.find((s) => s.id === id) : undefined;
}

export function useTravelForGuest(guestId: string | undefined): TravelSegment[] {
  const travelSegments = useStoreValue(travelSegmentsStore);
  return guestId ? travelSegments.filter((s) => s.guestId === guestId) : [];
}
