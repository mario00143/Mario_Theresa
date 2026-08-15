import { useState } from 'react';
import type { Guest, TravelSegment } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTravel } from '@/hooks/useTravel';
import { useGuests } from '@/hooks/useGuests';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { isTransportAssignmentActive } from '@/utils/transportLogic';
import { AssignTransportModal } from './AssignTransportModal';

export function UnassignedPickupDropPanel() {
  const { travelSegments } = useTravel();
  const { guests } = useGuests();
  const { transportAssignments } = useTransportAssignments();
  const { routes } = useTransportRoutes();
  const [target, setTarget] = useState<{ guest: Guest; segment: TravelSegment } | null>(null);

  const guestById = new Map(guests.map((g) => [g.id, g]));
  const assignedSegmentIds = new Set(transportAssignments.filter(isTransportAssignmentActive).map((a) => a.travelSegmentId).filter(Boolean));

  const unassignedPickups = travelSegments.filter((s) => s.direction === 'Arrival' && s.pickupRequired && !assignedSegmentIds.has(s.id));
  const unassignedDrops = travelSegments.filter((s) => s.direction === 'Departure' && s.dropRequired && !assignedSegmentIds.has(s.id));

  const renderList = (segments: TravelSegment[], label: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <Badge tone={segments.length > 0 ? 'critical' : 'success'}>{segments.length}</Badge>
      </CardHeader>
      <CardBody className="space-y-2">
        {segments.length === 0 ? (
          <EmptyState title="All caught up" description={`Every ${label.toLowerCase()} guest has a transport assignment.`} />
        ) : (
          segments.map((segment) => {
            const guest = guestById.get(segment.guestId);
            return (
              <div key={segment.id} className="flex items-center justify-between gap-2 rounded-lg border border-line-soft p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{guest?.fullName ?? 'Unknown guest'}</p>
                  <p className="text-xs text-ink-faint truncate">
                    {segment.origin} → {segment.destination}
                    {segment.direction === 'Arrival' && segment.arrivalTime ? ` · ${segment.arrivalTime}` : ''}
                    {segment.direction === 'Departure' && segment.departureTime ? ` · ${segment.departureTime}` : ''}
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => guest && setTarget({ guest, segment })} className="shrink-0">
                  Assign
                </Button>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderList(unassignedPickups, 'Pickups needed')}
      {renderList(unassignedDrops, 'Drops needed')}
      <AssignTransportModal open={target !== null} onClose={() => setTarget(null)} guest={target?.guest ?? null} segment={target?.segment} routes={routes} />
    </div>
  );
}
