import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useUI } from '@/context/UIContext';
import { TaskFilters } from './TaskFilters';
import { TaskListView } from './TaskListView';
import { useTaskFilters } from './useTaskFilters';

export function AllTasksView() {
  const { tasks } = useTasks();
  const { openQuickAdd } = useUI();
  const { filters, setFilter, resetFilters, filtered } = useTaskFilters(tasks);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">All Tasks</h2>
        <Button variant="primary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('task')}>
          New Task
        </Button>
      </div>
      <TaskFilters filters={filters} setFilter={setFilter} resetFilters={resetFilters} resultCount={filtered.length} />
      <TaskListView tasks={filtered} />
    </div>
  );
}
