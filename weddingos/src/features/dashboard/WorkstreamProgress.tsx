import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Task } from '@/types';
import { workstreamCompletion } from '@/utils/taskLogic';

export function WorkstreamProgress({ tasks }: { tasks: Task[] }) {
  const rows = workstreamCompletion(tasks).sort((a, b) => a.workstream.localeCompare(b.workstream));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress by workstream</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {rows.map((row) => (
          <div key={row.workstream}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink">{row.workstream}</span>
              <span className="text-ink-faint tabular-nums">
                {row.done}/{row.total} · {row.percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${row.percentage}%` }}
                role="progressbar"
                aria-valuenow={row.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${row.workstream} completion`}
              />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
