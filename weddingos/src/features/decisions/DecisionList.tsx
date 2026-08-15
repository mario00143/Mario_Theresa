import type { Decision } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { DecisionStatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { useUI } from '@/context/UIContext';
import { formatDisplayDate } from '@/utils/date';
import { isDecisionOverdue } from '@/utils/decisionLogic';

export function DecisionList({ decisions, emptyLabel = 'No decisions here' }: { decisions: Decision[]; emptyLabel?: string }) {
  const { openDecisionDetail } = useUI();

  if (decisions.length === 0) {
    return <EmptyState title={emptyLabel} />;
  }

  return (
    <ul className="divide-y divide-line-soft rounded-xl border border-line bg-surface overflow-hidden">
      {decisions.map((decision) => {
        const overdue = isDecisionOverdue(decision);
        return (
          <li key={decision.id}>
            <button
              type="button"
              onClick={() => openDecisionDetail(decision.id)}
              className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-surface-subtle"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{decision.title}</p>
                <p className="mt-0.5 text-xs text-ink-faint truncate">{decision.category} · {decision.owner}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`text-xs ${overdue ? 'text-critical font-medium' : 'text-ink-faint'}`}>
                  {decision.deadline ? formatDisplayDate(decision.deadline) : 'No deadline'}
                </span>
                <div className="flex items-center gap-1.5">
                  {overdue && <Badge tone="danger">Overdue</Badge>}
                  <DecisionStatusBadge status={decision.status} />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
