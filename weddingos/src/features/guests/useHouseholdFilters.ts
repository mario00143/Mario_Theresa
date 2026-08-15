import { useMemo, useState } from 'react';
import type { Guest, GuestEvent, Household, HouseholdRsvpState, HouseholdSide, InvitationPriority, InvitationStatus } from '@/types';
import { householdPrimaryRsvpState } from '@/utils/rsvpLogic';

export type HouseholdSortKey = 'name' | 'city' | 'priority' | 'status';

export interface HouseholdFilterState {
  search: string;
  side: HouseholdSide | 'All';
  city: string | 'All';
  invitationPriority: InvitationPriority | 'All';
  invitationStatus: InvitationStatus | 'All';
  invitedEvent: GuestEvent | 'All';
  rsvpState: HouseholdRsvpState | 'All';
  sortKey: HouseholdSortKey;
  sortDir: 'asc' | 'desc';
}

const DEFAULT_FILTERS: HouseholdFilterState = {
  search: '',
  side: 'All',
  city: 'All',
  invitationPriority: 'All',
  invitationStatus: 'All',
  invitedEvent: 'All',
  rsvpState: 'All',
  sortKey: 'name',
  sortDir: 'asc',
};

function matchesSearch(household: Household, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    household.householdName.toLowerCase().includes(q) ||
    household.primaryContactName.toLowerCase().includes(q) ||
    household.city.toLowerCase().includes(q) ||
    (household.primaryPhone ?? '').toLowerCase().includes(q) ||
    (household.email ?? '').toLowerCase().includes(q)
  );
}

export function useHouseholdFilters(households: Household[], guests: Guest[]) {
  const [filters, setFilters] = useState<HouseholdFilterState>(DEFAULT_FILTERS);

  const setFilter = <K extends keyof HouseholdFilterState>(key: K, value: HouseholdFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const cities = useMemo(() => Array.from(new Set(households.map((h) => h.city).filter(Boolean))).sort(), [households]);

  const filtered = useMemo(() => {
    let result = households.filter((household) => {
      if (filters.side !== 'All' && household.side !== filters.side) return false;
      if (filters.city !== 'All' && household.city !== filters.city) return false;
      if (filters.invitationPriority !== 'All' && household.invitationPriority !== filters.invitationPriority) return false;
      if (filters.invitationStatus !== 'All' && household.invitationStatus !== filters.invitationStatus) return false;
      if (filters.invitedEvent !== 'All' && !household.invitedEvents.includes(filters.invitedEvent)) return false;
      if (filters.rsvpState !== 'All' && householdPrimaryRsvpState(household, guests) !== filters.rsvpState) return false;
      if (!matchesSearch(household, filters.search)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sortKey) {
        case 'name':
          cmp = a.householdName.localeCompare(b.householdName);
          break;
        case 'city':
          cmp = a.city.localeCompare(b.city);
          break;
        case 'priority':
          cmp = a.invitationPriority.localeCompare(b.invitationPriority);
          break;
        case 'status':
          cmp = a.invitationStatus.localeCompare(b.invitationStatus);
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [households, guests, filters]);

  return { filters, setFilter, resetFilters, filtered, cities };
}
