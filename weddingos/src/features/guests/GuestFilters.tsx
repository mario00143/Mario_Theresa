import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AGE_CATEGORIES, DIETARY_PREFERENCES, GUEST_EVENTS, HOUSEHOLD_SIDES, RSVP_STATUSES } from '@/types';
import type { Household } from '@/types';
import type { GuestFilterState } from './useGuestFilters';

interface GuestFiltersProps {
  filters: GuestFilterState;
  setFilter: <K extends keyof GuestFilterState>(key: K, value: GuestFilterState[K]) => void;
  resetFilters: () => void;
  resultCount: number;
  households: Household[];
}

export function GuestFilters({ filters, setFilter, resetFilters, resultCount, households }: GuestFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search guests by name, phone, or email…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search guests"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select aria-label="Filter by side" value={filters.side} onChange={(e) => setFilter('side', e.target.value as GuestFilterState['side'])} className="w-auto! min-w-[8rem]">
          <option value="All">All sides</option>
          {HOUSEHOLD_SIDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by household"
          value={filters.householdId}
          onChange={(e) => setFilter('householdId', e.target.value)}
          className="w-auto! min-w-[10rem]"
        >
          <option value="All">All households</option>
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.householdName}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by age category"
          value={filters.ageCategory}
          onChange={(e) => setFilter('ageCategory', e.target.value as GuestFilterState['ageCategory'])}
          className="w-auto! min-w-[8rem]"
        >
          <option value="All">All ages</option>
          {AGE_CATEGORIES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>

        <Select aria-label="Filter by event" value={filters.event} onChange={(e) => setFilter('event', e.target.value as GuestFilterState['event'])} className="w-auto! min-w-[9rem]">
          <option value="All">All events</option>
          {GUEST_EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by RSVP status"
          value={filters.rsvpStatus}
          onChange={(e) => setFilter('rsvpStatus', e.target.value as GuestFilterState['rsvpStatus'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All RSVP statuses</option>
          {RSVP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by dietary preference"
          value={filters.dietaryPreference}
          onChange={(e) => setFilter('dietaryPreference', e.target.value as GuestFilterState['dietaryPreference'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All diets</option>
          {DIETARY_PREFERENCES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by accommodation required"
          value={filters.accommodationRequired}
          onChange={(e) => setFilter('accommodationRequired', e.target.value as GuestFilterState['accommodationRequired'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">Accommodation: All</option>
          <option value="Yes">Accommodation: Required</option>
          <option value="No">Accommodation: Not required</option>
        </Select>

        <Select
          aria-label="Filter by pickup required"
          value={filters.pickupRequired}
          onChange={(e) => setFilter('pickupRequired', e.target.value as GuestFilterState['pickupRequired'])}
          className="w-auto! min-w-[8rem]"
        >
          <option value="All">Pickup: All</option>
          <option value="Yes">Pickup: Required</option>
          <option value="No">Pickup: Not required</option>
        </Select>

        <Select
          aria-label="Filter by accessibility requirement"
          value={filters.accessibilityRequirement}
          onChange={(e) => setFilter('accessibilityRequirement', e.target.value as GuestFilterState['accessibilityRequirement'])}
          className="w-auto! min-w-[10rem]"
        >
          <option value="All">Accessibility: All</option>
          <option value="Yes">Accessibility: Required</option>
          <option value="No">Accessibility: Not required</option>
        </Select>

        <Select aria-label="Sort by" value={filters.sortKey} onChange={(e) => setFilter('sortKey', e.target.value as GuestFilterState['sortKey'])} className="w-auto! min-w-[9rem]">
          <option value="name">Sort: Name</option>
          <option value="household">Sort: Household</option>
          <option value="age">Sort: Age category</option>
        </Select>

        <Button variant="ghost" size="md" onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}>
          {filters.sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </Button>

        <Button variant="ghost" size="md" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      <p className="text-xs text-ink-faint">{resultCount} guest{resultCount === 1 ? '' : 's'}</p>
    </div>
  );
}
