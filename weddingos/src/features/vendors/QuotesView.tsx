import { FileText } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function QuotesView() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={<FileText className="size-8" aria-hidden="true" />}
          title="Quotations coming up"
          description="Compare quotes per vendor and select the accepted one here."
        />
      </CardBody>
    </Card>
  );
}
