import { BarChart3 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function VendorsReportsView() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={<BarChart3 className="size-8" aria-hidden="true" />}
          title="Financial reports coming up"
          description="Budget vs. forecast/actual, vendor commitments, payment due/history, refunds, and readiness reports will appear here."
        />
      </CardBody>
    </Card>
  );
}
