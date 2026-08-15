import { useMemo, useState } from 'react';
import type { EventScope, Priority, Task, TaskStatus, Workstream } from '@/types';

export type SortKey = 'dueDate' | 'title' | 'priority' | 'status' | 'workstream';

export interface TaskFilterState {
  search: string;
  event: EventScope | 'All';
  workstream: Workstream | 'All';
  owner: string | 'All';
  priority: Priority | 'All';
  status: TaskStatus | 'All';
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
}

const DEFAULT_FILTERS: TaskFilterState = {
  search: '',
  event: 'All',
  workstream: 'All',
  owner: 'All',
  priority: 'All',
  status: 'All',
  sortKey: 'dueDate',
  sortDir: 'asc',
};

const PRIORITY_ORDER: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUS_ORDER: Record<TaskStatus, number> = {
  'Not Started': 0,
  'In Progress': 1,
  Waiting: 2,
  Blocked: 3,
  Done: 4,
  Cancelled: 5,
};

function matchesSearch(task: Task, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    task.title.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q) ||
    task.workstream.toLowerCase().includes(q) ||
    task.owner.toLowerCase().includes(q) ||
    task.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);

  const setFilter = <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let result = tasks.filter((task) => {
      if (filters.event !== 'All' && task.event !== filters.event) return false;
      if (filters.workstream !== 'All' && task.workstream !== filters.workstream) return false;
      if (filters.owner !== 'All' && task.owner !== filters.owner) return false;
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false;
      if (filters.status !== 'All' && task.status !== filters.status) return false;
      if (!matchesSearch(task, filters.search)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sortKey) {
        case 'dueDate':
          cmp = (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99');
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'priority':
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'workstream':
          cmp = a.workstream.localeCompare(b.workstream);
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [tasks, filters]);

  return { filters, setFilter, resetFilters, filtered };
}
