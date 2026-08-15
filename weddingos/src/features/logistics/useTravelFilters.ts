import { useMemo, useState } from 'react';
import type { EventScope, Guest, Household, TravelBookingStatus, TravelDirection, TravelMode, TravelSegment } from '@/types';

export type TravelSortKey = 'date' | 'guest';

export interface TravelFilterState {
  search: string;
  direction: TravelDirection | 'All';
  event: EventScope | 'All';
  travelMode: TravelMode | 'All';
  bookingStatus: TravelBookingStatus | 'All';
  pickupOrDrop: 'All' | 'Pickup Required' | 'Drop Required';
  sortDir: 'asc' | 'desc';
}

const DEFAULT_FILTERS: TravelFilterState = {
  search: '',
  direction: 'All',
  event: 'All',
  travelMode: 'All',
  bookingStatus: 'All',
  pickupOrDrop: 'All',
  sortDir: 'asc',
};

function segmentDate(segment: TravelSegment): string {
  return (segment.direction === 'Arrival' ? segment.arrivalDate : segment.departureDate) ?? '';
}

function matchesSearch(segment: TravelSegment, guest: Guest | undefined, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return [
    guest?.fullName,
    segment.carrier,
    segment.serviceNumber,
    segment.bookingReference,
    segment.origin,
    segment.destination,
  ]
    .filter(Boolean)
    .some((value) => (value as string).toLowerCase().includes(q));
}

export function useTravelFilters(segments: TravelSegment[], guests: Guest[], _households: Household[]) {
  const [filters, setFilters] = useState<TravelFilterState>(DEFAULT_FILTERS);
  const guestById = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);

  const setFilter = <K extends keyof TravelFilterState>(key: K, value: TravelFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let result = segments.filter((segment) => {
      const guest = guestById.get(segment.guestId);
      if (filters.direction !== 'All' && segment.direction !== filters.direction) return false;
      if (filters.event !== 'All' && segment.event !== filters.event) return false;
      if (filters.travelMode !== 'All' && segment.travelMode !== filters.travelMode) return false;
      if (filters.bookingStatus !== 'All' && segment.bookingStatus !== filters.bookingStatus) return false;
      if (filters.pickupOrDrop === 'Pickup Required' && !segment.pickupRequired) return false;
      if (filters.pickupOrDrop === 'Drop Required' && !segment.dropRequired) return false;
      if (!matchesSearch(segment, guest, filters.search)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      const dateA = segmentDate(a);
      const dateB = segmentDate(b);
      if (dateA && dateB) cmp = dateA.localeCompare(dateB);
      else if (dateA) cmp = -1;
      else if (dateB) cmp = 1;
      if (cmp === 0) {
        const nameA = guestById.get(a.guestId)?.fullName ?? '';
        const nameB = guestById.get(b.guestId)?.fullName ?? '';
        cmp = nameA.localeCompare(nameB);
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [segments, guestById, filters]);

  return { filters, setFilter, resetFilters, filtered };
}
