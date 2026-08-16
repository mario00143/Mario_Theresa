import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EVENTS, VENDOR_CATEGORIES, VENDOR_STATUSES } from '@/types';
import type { VendorFilterState } from './useVendorFilters';

interface VendorFiltersProps {
  filters: VendorFilterState;
  setFilter: <K extends keyof VendorFilterState>(key: K, value: VendorFilterState[K]) => void;
  resetFilters: () => void;
  resultCount: number;
}

export function VendorFilters({ filters, setFilter, resetFilters, resultCount }: VendorFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search vendors by name, city, email, or phone…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search vendors"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select aria-label="Filter by status" value={filters.status} onChange={(e) => setFilter('status', e.target.value as VendorFilterState['status'])} className="w-auto! min-w-[9rem]">
          <option value="All">All statuses</option>
          {VENDOR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select aria-label="Filter by category" value={filters.category} onChange={(e) => setFilter('category', e.target.value as VendorFilterState['category'])} className="w-auto! min-w-[10rem]">
          <option value="All">All categories</option>
          {VENDOR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select aria-label="Filter by event" value={filters.event} onChange={(e) => setFilter('event', e.target.value as VendorFilterState['event'])} className="w-auto! min-w-[9rem]">
          <option value="All">All events</option>
          {EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>

        <Select aria-label="Sort by" value={filters.sortKey} onChange={(e) => setFilter('sortKey', e.target.value as VendorFilterState['sortKey'])} className="w-auto! min-w-[9rem]">
          <option value="name">Sort: Name</option>
          <option value="category">Sort: Category</option>
          <option value="status">Sort: Status</option>
        </Select>

        <Button variant="ghost" size="md" onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}>
          {filters.sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </Button>

        <Button variant="ghost" size="md" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      <p className="text-xs text-ink-faint">{resultCount} vendor{resultCount === 1 ? '' : 's'}</p>
    </div>
  );
}
