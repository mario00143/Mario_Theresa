import { FileSignature } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function ContractsView() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={<FileSignature className="size-8" aria-hidden="true" />}
          title="Contracts coming up"
          description="Scope, terms, and settlement details per signed vendor contract will appear here."
        />
      </CardBody>
    </Card>
  );
}
