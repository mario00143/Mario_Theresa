import { Receipt } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function PaymentsView() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={<Receipt className="size-8" aria-hidden="true" />}
          title="Payment calendar coming up"
          description="Upcoming, due, and overdue payment schedules — with recording and refunds — will appear here."
        />
      </CardBody>
    </Card>
  );
}
