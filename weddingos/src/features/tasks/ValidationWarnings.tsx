import { TriangleAlert } from 'lucide-react';
import type { TaskValidationIssue } from '@/utils/taskLogic';

export function ValidationWarnings({ issues }: { issues: TaskValidationIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="rounded-lg border border-warning/30 bg-warning-bg px-3.5 py-3 space-y-1.5">
      {issues.map((issue) => (
        <div key={issue.field} className="flex items-start gap-2 text-sm text-warning">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{issue.message}</span>
        </div>
      ))}
    </div>
  );
}
