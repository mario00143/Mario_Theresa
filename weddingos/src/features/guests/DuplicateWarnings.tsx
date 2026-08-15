import { TriangleAlert } from 'lucide-react';
import type { DuplicateWarning } from '@/utils/duplicateDetection';

export function DuplicateWarnings({ warnings }: { warnings: DuplicateWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-warning/30 bg-warning-bg px-3.5 py-3 space-y-1.5">
      <p className="text-sm font-medium text-warning">Possible duplicate — review before continuing</p>
      {warnings.map((w) => (
        <div key={`${w.matchId}-${w.reason}`} className="flex items-start gap-2 text-sm text-warning">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{w.reason}</span>
        </div>
      ))}
    </div>
  );
}
