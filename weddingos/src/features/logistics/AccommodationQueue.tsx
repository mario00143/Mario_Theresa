import type { AccommodationQueueEntry } from '@/utils/logisticsStats';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDisplayDate } from '@/utils/date';

interface AccommodationQueueProps {
  entries: AccommodationQueueEntry[];
  onAssign: (entry: AccommodationQueueEntry) => void;
}

export function AccommodationQueue({ entries, onAssign }: AccommodationQueueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accommodation requirement queue</CardTitle>
        <Badge tone={entries.length > 0 ? 'critical' : 'success'}>{entries.length} waiting</Badge>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {entries.length === 0 ? (
          <EmptyState title="Everyone who needs a room has one" description="New requirements will appear here automatically." />
        ) : (
          entries.map((entry) => (
            <div key={entry.guest.id} className="flex items-center justify-between gap-3 rounded-lg border border-line-soft p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{entry.guest.fullName}</p>
                <p className="text-xs text-ink-faint truncate">{entry.household?.householdName ?? 'No household'}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  {entry.priorityReason}
                  {entry.earliestArrivalDate && ` · Arrives ${formatDisplayDate(entry.earliestArrivalDate)}`}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => onAssign(entry)} className="shrink-0">
                Assign
              </Button>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
