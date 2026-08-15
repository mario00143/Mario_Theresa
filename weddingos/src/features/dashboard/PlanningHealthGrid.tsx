import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import type { PlanningHealth } from '@/utils/dashboardStats';

export function PlanningHealthGrid({ health }: { health: PlanningHealth }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning health</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Overall completion" value={`${health.overallCompletion}%`} tone="success" />
        <StatTile label="Critical completion" value={`${health.criticalCompletion}%`} tone={health.criticalCompletion < 100 ? 'warning' : 'success'} />
        <StatTile label="Total tasks" value={health.totalTasks} />
        <StatTile label="Completed tasks" value={health.completedTasks} tone="success" />
        <StatTile label="Overdue tasks" value={health.overdueTasks} tone={health.overdueTasks > 0 ? 'critical' : 'default'} />
        <StatTile label="Due in 7 days" value={health.dueNext7Days} tone={health.dueNext7Days > 0 ? 'warning' : 'default'} />
        <StatTile label="Due in 14 days" value={health.dueNext14Days} />
        <StatTile label="Blocked tasks" value={health.blockedTasks} tone={health.blockedTasks > 0 ? 'critical' : 'default'} />
        <StatTile label="Pending decisions" value={health.pendingDecisions} tone={health.pendingDecisions > 0 ? 'warning' : 'default'} />
      </CardBody>
    </Card>
  );
}
