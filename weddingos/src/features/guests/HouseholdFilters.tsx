import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { GUEST_EVENTS, HOUSEHOLD_RSVP_STATES, HOUSEHOLD_SIDES, INVITATION_PRIORITIES, INVITATION_STATUSES } from '@/types';
import type { HouseholdFilterState } from './useHouseholdFilters';

interface HouseholdFiltersProps {
  filters: HouseholdFilterState;
  setFilter: <K extends keyof HouseholdFilterState>(key: K, value: HouseholdFilterState[K]) => void;
  resetFilters: () => void;
  resultCount: number;
  cities: string[];
}

export function HouseholdFilters({ filters, setFilter, resetFilters, resultCount, cities }: HouseholdFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search households by name, contact, city, phone, or email…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search households"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select aria-label="Filter by side" value={filters.side} onChange={(e) => setFilter('side', e.target.value as HouseholdFilterState['side'])} className="w-auto! min-w-[8rem]">
          <option value="All">All sides</option>
          {HOUSEHOLD_SIDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select aria-label="Filter by city" value={filters.city} onChange={(e) => setFilter('city', e.target.value)} className="w-auto! min-w-[9rem]">
          <option value="All">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by invitation priority"
          value={filters.invitationPriority}
          onChange={(e) => setFilter('invitationPriority', e.target.value as HouseholdFilterState['invitationPriority'])}
          className="w-auto! min-w-[10rem]"
        >
          <option value="All">All priorities</option>
          {INVITATION_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by invitation status"
          value={filters.invitationStatus}
          onChange={(e) => setFilter('invitationStatus', e.target.value as HouseholdFilterState['invitationStatus'])}
          className="w-auto! min-w-[10rem]"
        >
          <option value="All">All invitation statuses</option>
          {INVITATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by invited event"
          value={filters.invitedEvent}
          onChange={(e) => setFilter('invitedEvent', e.target.value as HouseholdFilterState['invitedEvent'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All events</option>
          {GUEST_EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by RSVP state"
          value={filters.rsvpState}
          onChange={(e) => setFilter('rsvpState', e.target.value as HouseholdFilterState['rsvpState'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All RSVP states</option>
          {HOUSEHOLD_RSVP_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sort by"
          value={filters.sortKey}
          onChange={(e) => setFilter('sortKey', e.target.value as HouseholdFilterState['sortKey'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="name">Sort: Name</option>
          <option value="city">Sort: City</option>
          <option value="priority">Sort: Priority</option>
          <option value="status">Sort: Status</option>
        </Select>

        <Button variant="ghost" size="md" onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}>
          {filters.sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </Button>

        <Button variant="ghost" size="md" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      <p className="text-xs text-ink-faint">{resultCount} household{resultCount === 1 ? '' : 's'}</p>
    </div>
  );
}
