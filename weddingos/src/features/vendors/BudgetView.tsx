import { PiggyBank } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function BudgetView() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={<PiggyBank className="size-8" aria-hidden="true" />}
          title="Budget coming up"
          description="Categories and line items with planned, forecast, committed, and actual amounts will appear here."
        />
      </CardBody>
    </Card>
  );
}
