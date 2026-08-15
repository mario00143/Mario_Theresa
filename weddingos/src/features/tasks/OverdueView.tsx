import { useTasks } from '@/hooks/useTasks';
import { isTaskOverdue } from '@/utils/taskLogic';
import { TaskListView } from './TaskListView';

export function OverdueView() {
  const { tasks } = useTasks();
  const overdue = tasks
    .filter((t) => isTaskOverdue(t))
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));

  return (
    <TaskListView
      tasks={overdue}
      emptyTitle="No overdue tasks"
      emptyDescription="Every incomplete task is on schedule."
    />
  );
}
