import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useDecisions } from '@/hooks/useDecisions';
import { useUI } from '@/context/UIContext';
import { DECISION_STATUSES } from '@/types';
import { isDecisionDueSoon, isDecisionOverdue } from '@/utils/decisionLogic';
import { DecisionList } from '@/features/decisions/DecisionList';

export function DecisionsPage() {
  const { decisions } = useDecisions();
  const { openQuickAdd } = useUI();

  const overdue = decisions.filter((d) => isDecisionOverdue(d));
  const dueSoon = decisions.filter((d) => isDecisionDueSoon(d));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Decisions</h1>
          <p className="text-sm text-ink-faint mt-0.5">Every decision that needs an owner and a deadline.</p>
        </div>
        <Button variant="primary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('decision')}>
          New Decision
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total decisions" value={decisions.length} />
        <StatTile label="Overdue" value={overdue.length} tone={overdue.length > 0 ? 'critical' : 'default'} />
        <StatTile label="Due within 7 days" value={dueSoon.length} tone={dueSoon.length > 0 ? 'warning' : 'default'} />
        <StatTile label="Decided" value={decisions.filter((d) => d.status === 'Decided').length} tone="success" />
      </div>

      {overdue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <DecisionList decisions={overdue} />
          </CardBody>
        </Card>
      )}

      {dueSoon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Due soon</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <DecisionList decisions={dueSoon} />
          </CardBody>
        </Card>
      )}

      {DECISION_STATUSES.map((status) => {
        const group = decisions.filter((d) => d.status === status);
        if (group.length === 0) return null;
        return (
          <Card key={status}>
            <CardHeader>
              <CardTitle>{status}</CardTitle>
              <span className="text-xs font-medium text-ink-faint">{group.length}</span>
            </CardHeader>
            <CardBody className="p-0">
              <DecisionList decisions={group} />
            </CardBody>
          </Card>
        );
      })}

      {decisions.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-sm text-ink-faint">No decisions yet. Use Quick Add to create one.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
