import { useState } from 'react';
import type { Task } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUI } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { formatDisplayDate } from '@/utils/date';
import { isTaskOverdue } from '@/utils/taskLogic';
import { TaskRowActions } from './TaskRowActions';

interface TaskListViewProps {
  tasks: Task[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TaskListView({ tasks, emptyTitle = 'No tasks found', emptyDescription = 'Try adjusting your filters.' }: TaskListViewProps) {
  const { openTaskDetail } = useUI();
  const { duplicateTask, deleteTask } = useTasks();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const taskToDelete = tasks.find((t) => t.id === confirmDeleteId);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Workstream</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
                className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
              >
                <td className="px-4 py-3 max-w-[20rem]">
                  <p className="font-medium text-ink truncate">{task.title}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{task.workstream}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{task.event}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{task.owner}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${isTaskOverdue(task) ? 'text-critical font-medium' : 'text-ink-soft'}`}>
                  {formatDisplayDate(task.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <TaskRowActions onDuplicate={() => duplicateTask(task.id)} onDelete={() => setConfirmDeleteId(task.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="sm:hidden space-y-2.5">
        {tasks.map((task) => (
          <li key={task.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => openTaskDetail(task.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openTaskDetail(task.id);
              }}
              className="rounded-xl border border-line bg-surface p-4 cursor-pointer active:bg-surface-subtle"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink leading-snug">{task.title}</p>
                <TaskRowActions onDuplicate={() => duplicateTask(task.id)} onDelete={() => setConfirmDeleteId(task.id)} />
              </div>
              <p className="mt-1 text-xs text-ink-faint">{task.workstream} · {task.owner}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <span className={`text-xs ml-auto ${isTaskOverdue(task) ? 'text-critical font-medium' : 'text-ink-faint'}`}>
                  {formatDisplayDate(task.dueDate)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDeleteId) deleteTask(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
