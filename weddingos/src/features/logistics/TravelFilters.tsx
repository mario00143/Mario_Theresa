import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EVENTS, TRAVEL_BOOKING_STATUSES, TRAVEL_DIRECTIONS, TRAVEL_MODES } from '@/types';
import type { TravelFilterState } from './useTravelFilters';

interface TravelFiltersProps {
  filters: TravelFilterState;
  setFilter: <K extends keyof TravelFilterState>(key: K, value: TravelFilterState[K]) => void;
  resetFilters: () => void;
  resultCount: number;
}

export function TravelFilters({ filters, setFilter, resetFilters, resultCount }: TravelFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search by guest, carrier, service number, reference, or location…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search travel"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select aria-label="Filter by direction" value={filters.direction} onChange={(e) => setFilter('direction', e.target.value as TravelFilterState['direction'])} className="w-auto! min-w-[9rem]">
          <option value="All">All directions</option>
          {TRAVEL_DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select aria-label="Filter by event" value={filters.event} onChange={(e) => setFilter('event', e.target.value as TravelFilterState['event'])} className="w-auto! min-w-[9rem]">
          <option value="All">All events</option>
          {EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>

        <Select aria-label="Filter by mode" value={filters.travelMode} onChange={(e) => setFilter('travelMode', e.target.value as TravelFilterState['travelMode'])} className="w-auto! min-w-[8rem]">
          <option value="All">All modes</option>
          {TRAVEL_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by booking status"
          value={filters.bookingStatus}
          onChange={(e) => setFilter('bookingStatus', e.target.value as TravelFilterState['bookingStatus'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All booking statuses</option>
          {TRAVEL_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by pickup/drop requirement"
          value={filters.pickupOrDrop}
          onChange={(e) => setFilter('pickupOrDrop', e.target.value as TravelFilterState['pickupOrDrop'])}
          className="w-auto! min-w-[10rem]"
        >
          <option value="All">Pickup/Drop: All</option>
          <option value="Pickup Required">Pickup required</option>
          <option value="Drop Required">Drop required</option>
        </Select>

        <Button variant="ghost" size="md" onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}>
          {filters.sortDir === 'asc' ? '↑ Date Asc' : '↓ Date Desc'}
        </Button>

        <Button variant="ghost" size="md" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      <p className="text-xs text-ink-faint">{resultCount} travel segment{resultCount === 1 ? '' : 's'}</p>
    </div>
  );
}
