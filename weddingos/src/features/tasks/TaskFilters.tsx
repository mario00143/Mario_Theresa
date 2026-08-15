import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EVENTS, PRIORITIES, TASK_STATUSES, WORKSTREAMS } from '@/types';
import { useOwners } from '@/hooks/useOwners';
import type { TaskFilterState } from './useTaskFilters';

interface TaskFiltersProps {
  filters: TaskFilterState;
  setFilter: <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => void;
  resetFilters: () => void;
  resultCount: number;
}

export function TaskFilters({ filters, setFilter, resetFilters, resultCount }: TaskFiltersProps) {
  const { owners } = useOwners();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search tasks…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search tasks"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          aria-label="Filter by event"
          value={filters.event}
          onChange={(e) => setFilter('event', e.target.value as TaskFilterState['event'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All events</option>
          {EVENTS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by workstream"
          value={filters.workstream}
          onChange={(e) => setFilter('workstream', e.target.value as TaskFilterState['workstream'])}
          className="w-auto! min-w-[10rem]"
        >
          <option value="All">All workstreams</option>
          {WORKSTREAMS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by owner"
          value={filters.owner}
          onChange={(e) => setFilter('owner', e.target.value)}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.name}>
              {o.name}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by priority"
          value={filters.priority}
          onChange={(e) => setFilter('priority', e.target.value as TaskFilterState['priority'])}
          className="w-auto! min-w-[8rem]"
        >
          <option value="All">All priorities</option>
          {PRIORITIES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value as TaskFilterState['status'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="All">All statuses</option>
          {TASK_STATUSES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sort by"
          value={filters.sortKey}
          onChange={(e) => setFilter('sortKey', e.target.value as TaskFilterState['sortKey'])}
          className="w-auto! min-w-[9rem]"
        >
          <option value="dueDate">Sort: Due date</option>
          <option value="title">Sort: Title</option>
          <option value="priority">Sort: Priority</option>
          <option value="status">Sort: Status</option>
          <option value="workstream">Sort: Workstream</option>
        </Select>

        <Button
          variant="ghost"
          size="md"
          onClick={() => setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}
          aria-label={`Sort direction: ${filters.sortDir === 'asc' ? 'ascending' : 'descending'}`}
        >
          {filters.sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </Button>

        <Button variant="ghost" size="md" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      <p className="text-xs text-ink-faint">{resultCount} task{resultCount === 1 ? '' : 's'}</p>
    </div>
  );
}
