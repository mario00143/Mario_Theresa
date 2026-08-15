import { useTasks } from '@/hooks/useTasks';
import { KanbanView } from './KanbanView';

export function KanbanTasksRoute() {
  const { tasks } = useTasks();
  return <KanbanView tasks={tasks} />;
}
