import { useState } from 'react';
import type { ArrivalCluster } from '@/utils/arrivalClustering';
import type { Guest } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { isTransportAssignmentActive } from '@/utils/transportLogic';
import { CreateRouteFromClusterModal } from './CreateRouteFromClusterModal';

interface ClusterPanelProps {
  clusters: ArrivalCluster[];
  guests: Guest[];
  direction: 'Arrival' | 'Departure';
}

export function ClusterPanel({ clusters, guests, direction }: ClusterPanelProps) {
  const { transportAssignments } = useTransportAssignments();
  const [selectedCluster, setSelectedCluster] = useState<ArrivalCluster | null>(null);
  const guestById = new Map(guests.map((g) => [g.id, g]));

  if (clusters.length === 0) {
    return <EmptyState title={`No ${direction === 'Arrival' ? 'arrivals' : 'departures'} with a date and time on file`} description="Clusters appear once travel segments have a date, time, and location." />;
  }

  return (
    <div className="space-y-3">
      {clusters.map((cluster, i) => {
        const assignedCount = cluster.segments.filter((s) => transportAssignments.some((a) => a.travelSegmentId === s.id && isTransportAssignmentActive(a))).length;
        const allAssigned = assignedCount === cluster.segments.length;
        return (
          <Card key={`${cluster.location}-${cluster.date}-${i}`}>
            <CardHeader>
              <CardTitle>
                {cluster.location} · {cluster.date}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge tone={cluster.segments.length > 1 ? 'info' : 'neutral'}>
                  {cluster.segments.length} guest{cluster.segments.length === 1 ? '' : 's'}
                </Badge>
                <Badge tone={allAssigned ? 'success' : 'warning'}>
                  {assignedCount}/{cluster.segments.length} assigned
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-2.5">
              <p className="text-xs text-ink-faint">
                Between {cluster.earliestTime} and {cluster.latestTime}
                {cluster.segments.length > 1 && ' — a shared vehicle may work for this group.'}
              </p>
              <ul className="space-y-1">
                {cluster.segments.map((segment) => {
                  const guest = guestById.get(segment.guestId);
                  const hasAssignment = transportAssignments.some((a) => a.travelSegmentId === segment.id && isTransportAssignmentActive(a));
                  return (
                    <li key={segment.id} className="flex items-center justify-between text-xs">
                      <span className="text-ink-soft">
                        {guest?.fullName ?? 'Unknown guest'} · {direction === 'Arrival' ? segment.arrivalTime : segment.departureTime}
                      </span>
                      <Badge tone={hasAssignment ? 'success' : 'neutral'}>{hasAssignment ? 'Assigned' : 'Unassigned'}</Badge>
                    </li>
                  );
                })}
              </ul>
              {!allAssigned && (
                <Button variant="secondary" size="sm" onClick={() => setSelectedCluster(cluster)}>
                  Create Route from this Cluster
                </Button>
              )}
            </CardBody>
          </Card>
        );
      })}

      <CreateRouteFromClusterModal open={selectedCluster !== null} onClose={() => setSelectedCluster(null)} cluster={selectedCluster} direction={direction} />
    </div>
  );
}
