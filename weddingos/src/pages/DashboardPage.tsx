import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { EventCards } from '@/features/dashboard/EventCards';
import { PlanningHealthGrid } from '@/features/dashboard/PlanningHealthGrid';
import { AttentionRequired } from '@/features/dashboard/AttentionRequired';
import { UpcomingTasksList } from '@/features/dashboard/UpcomingTasksList';
import { WorkstreamProgress } from '@/features/dashboard/WorkstreamProgress';
import { buildAttentionItems, computePlanningHealth, upcomingIncompleteTasks } from '@/utils/dashboardStats';

export function DashboardPage() {
  const { tasks } = useTasks();
  const { decisions } = useDecisions();

  const health = computePlanningHealth(tasks, decisions);
  const attentionItems = buildAttentionItems(tasks, decisions);
  const upcoming = upcomingIncompleteTasks(tasks, 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-faint mt-0.5">Your wedding command center at a glance.</p>
      </div>

      <EventCards />
      <PlanningHealthGrid health={health} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AttentionRequired items={attentionItems} />
        <UpcomingTasksList tasks={upcoming} />
      </div>

      <WorkstreamProgress tasks={tasks} />
    </div>
  );
}
