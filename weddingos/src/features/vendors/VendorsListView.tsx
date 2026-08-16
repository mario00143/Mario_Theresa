import { Store } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function VendorsListView() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={<Store className="size-8" aria-hidden="true" />}
          title="Vendor directory coming up"
          description="Search, filter, and manage vendors here — contacts, contract status, and readiness."
        />
      </CardBody>
    </Card>
  );
}
