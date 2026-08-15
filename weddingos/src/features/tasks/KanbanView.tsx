import type { Task, TaskStatus } from '@/types';
import { TASK_STATUSES } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Select } from '@/components/ui/Field';
import { useTasks } from '@/hooks/useTasks';
import { useUI } from '@/context/UIContext';
import { formatDisplayDate } from '@/utils/date';
import { isTaskOverdue } from '@/utils/taskLogic';

const COLUMNS: TaskStatus[] = ['Not Started', 'In Progress', 'Waiting', 'Blocked', 'Done'];

export function KanbanView({ tasks }: { tasks: Task[] }) {
  const { setTaskStatus } = useTasks();
  const { openTaskDetail } = useUI();

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column);
        return (
          <div key={column} className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-semibold text-ink">{column}</h3>
              <span className="text-xs text-ink-faint">{columnTasks.length}</span>
            </div>
            <div className="space-y-2.5 rounded-xl bg-surface-muted p-2.5 min-h-24">
              {columnTasks.length === 0 && <p className="text-xs text-ink-faint px-2 py-4 text-center">No tasks</p>}
              {columnTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-line bg-surface p-3">
                  <button
                    type="button"
                    onClick={() => openTaskDetail(task.id)}
                    className="text-left text-sm font-medium text-ink hover:underline"
                  >
                    {task.title}
                  </button>
                  <p className="mt-1 text-xs text-ink-faint">{task.owner}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <PriorityBadge priority={task.priority} />
                    <span className={`text-xs ${isTaskOverdue(task) ? 'text-critical font-medium' : 'text-ink-faint'}`}>
                      {formatDisplayDate(task.dueDate)}
                    </span>
                  </div>
                  <Select
                    aria-label={`Change status for "${task.title}"`}
                    value={task.status}
                    onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="mt-2.5 h-8 text-xs"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
