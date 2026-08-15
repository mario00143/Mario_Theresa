import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Task } from '@/types';
import { useUI } from '@/context/UIContext';
import { formatDisplayDate } from '@/utils/date';

export function UpcomingTasksList({ tasks }: { tasks: Task[] }) {
  const { openTaskDetail } = useUI();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming tasks</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        {tasks.length === 0 ? (
          <EmptyState title="No upcoming tasks" description="Every task with a due date is complete." />
        ) : (
          <ul className="divide-y divide-line-soft">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => openTaskDetail(task.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-subtle"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                    <p className="mt-0.5 text-xs text-ink-faint truncate">{task.workstream} · {task.owner}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-ink-faint">{formatDisplayDate(task.dueDate)}</span>
                    <div className="flex items-center gap-1">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
