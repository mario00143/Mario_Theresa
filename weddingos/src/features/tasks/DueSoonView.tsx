import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTasks } from '@/hooks/useTasks';
import { isTaskClosed } from '@/utils/taskLogic';
import { daysUntil } from '@/utils/date';
import { TaskListView } from './TaskListView';

export function DueSoonView() {
  const { tasks } = useTasks();

  const incomplete = tasks.filter((t) => !isTaskClosed(t) && t.dueDate);
  const withDiff = incomplete.map((t) => ({ task: t, diff: daysUntil(t.dueDate) ?? Infinity }));

  const dueToday = withDiff.filter((x) => x.diff === 0).map((x) => x.task);
  const due7 = withDiff.filter((x) => x.diff > 0 && x.diff <= 7).map((x) => x.task);
  const due14 = withDiff.filter((x) => x.diff > 7 && x.diff <= 14).map((x) => x.task);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Due today</CardTitle>
        </CardHeader>
        <CardBody>
          <TaskListView tasks={dueToday} emptyTitle="Nothing due today" />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Due within 7 days</CardTitle>
        </CardHeader>
        <CardBody>
          <TaskListView tasks={due7} emptyTitle="Nothing due in the next 7 days" />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Due within 14 days</CardTitle>
        </CardHeader>
        <CardBody>
          <TaskListView tasks={due14} emptyTitle="Nothing due in the next 8–14 days" />
        </CardBody>
      </Card>
    </div>
  );
}
