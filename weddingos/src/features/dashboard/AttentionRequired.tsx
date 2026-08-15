import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AttentionItem } from '@/utils/dashboardStats';
import { useUI } from '@/context/UIContext';

export function AttentionRequired({ items }: { items: AttentionItem[] }) {
  const { openTaskDetail, openDecisionDetail } = useUI();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attention required</CardTitle>
        {items.length > 0 && <span className="text-xs font-medium text-ink-faint">{items.length}</span>}
      </CardHeader>
      <CardBody className="p-0">
        {items.length === 0 ? (
          <EmptyState title="Nothing needs attention" description="No overdue, blocked, or at-risk items right now." />
        ) : (
          <ul className="divide-y divide-line-soft max-h-96 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => (item.linkType === 'task' ? openTaskDetail(item.linkId) : openDecisionDetail(item.linkId))}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-surface-subtle"
                >
                  <TriangleAlert
                    className={`size-4 shrink-0 mt-0.5 ${item.severity === 'critical' ? 'text-critical' : 'text-warning'}`}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-ink">{item.message}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
