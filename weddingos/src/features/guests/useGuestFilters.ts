import { useMemo, useState } from 'react';
import type { AgeCategory, DietaryPreference, Guest, GuestEvent, Household, HouseholdSide, RsvpStatus } from '@/types';
import { getGuestRsvpStatus } from '@/utils/rsvpLogic';

export type GuestSortKey = 'name' | 'household' | 'age';

export interface GuestFilterState {
  search: string;
  side: HouseholdSide | 'All';
  householdId: string | 'All';
  ageCategory: AgeCategory | 'All';
  event: GuestEvent | 'All';
  rsvpStatus: RsvpStatus | 'All';
  dietaryPreference: DietaryPreference | 'All';
  accommodationRequired: 'All' | 'Yes' | 'No';
  pickupRequired: 'All' | 'Yes' | 'No';
  accessibilityRequirement: 'All' | 'Yes' | 'No';
  sortKey: GuestSortKey;
  sortDir: 'asc' | 'desc';
}

const DEFAULT_FILTERS: GuestFilterState = {
  search: '',
  side: 'All',
  householdId: 'All',
  ageCategory: 'All',
  event: 'All',
  rsvpStatus: 'All',
  dietaryPreference: 'All',
  accommodationRequired: 'All',
  pickupRequired: 'All',
  accessibilityRequirement: 'All',
  sortKey: 'name',
  sortDir: 'asc',
};

function matchesSearch(guest: Guest, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    guest.fullName.toLowerCase().includes(q) ||
    (guest.phone ?? '').toLowerCase().includes(q) ||
    (guest.email ?? '').toLowerCase().includes(q)
  );
}

export function useGuestFilters(guests: Guest[], households: Household[]) {
  const [filters, setFilters] = useState<GuestFilterState>(DEFAULT_FILTERS);
  const householdById = useMemo(() => new Map(households.map((h) => [h.id, h])), [households]);

  const setFilter = <K extends keyof GuestFilterState>(key: K, value: GuestFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let result = guests.filter((guest) => {
      const household = householdById.get(guest.householdId);
      if (filters.side !== 'All' && household?.side !== filters.side) return false;
      if (filters.householdId !== 'All' && guest.householdId !== filters.householdId) return false;
      if (filters.ageCategory !== 'All' && guest.ageCategory !== filters.ageCategory) return false;
      if (filters.event !== 'All' && !guest.invitedEvents.includes(filters.event)) return false;
      if (filters.rsvpStatus !== 'All') {
        const matchesAnyEvent = guest.invitedEvents.some((event) => getGuestRsvpStatus(guest, event) === filters.rsvpStatus);
        if (!matchesAnyEvent) return false;
      }
      if (filters.dietaryPreference !== 'All' && guest.dietaryPreference !== filters.dietaryPreference) return false;
      if (filters.accommodationRequired !== 'All' && (guest.accommodationRequired ? 'Yes' : 'No') !== filters.accommodationRequired) return false;
      if (filters.pickupRequired !== 'All' && (guest.pickupRequired ? 'Yes' : 'No') !== filters.pickupRequired) return false;
      if (filters.accessibilityRequirement !== 'All') {
        const hasRequirement = Boolean(guest.accessibilityRequirements) || guest.elderlyAssistanceRequired;
        if ((hasRequirement ? 'Yes' : 'No') !== filters.accessibilityRequirement) return false;
      }
      if (!matchesSearch(guest, filters.search)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sortKey) {
        case 'name':
          cmp = a.fullName.localeCompare(b.fullName);
          break;
        case 'household':
          cmp = (householdById.get(a.householdId)?.householdName ?? '').localeCompare(householdById.get(b.householdId)?.householdName ?? '');
          break;
        case 'age':
          cmp = a.ageCategory.localeCompare(b.ageCategory);
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [guests, householdById, filters]);

  return { filters, setFilter, resetFilters, filtered };
}
