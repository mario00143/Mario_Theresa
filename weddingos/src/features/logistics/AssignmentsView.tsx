import { useState } from 'react';
import { useTravel } from '@/hooks/useTravel';
import { useGuests } from '@/hooks/useGuests';
import { clusterArrivals, clusterDepartures } from '@/utils/arrivalClustering';
import { ClusterPanel } from './ClusterPanel';
import { UnassignedPickupDropPanel } from './UnassignedPickupDropPanel';
import { ShuttleAssignmentsPanel } from './ShuttleAssignmentsPanel';

const SUB_TABS = ['Unassigned', 'Arrivals', 'Departures', 'Shuttles'] as const;
type SubTab = (typeof SUB_TABS)[number];

export function AssignmentsView() {
  const { travelSegments } = useTravel();
  const { guests } = useGuests();
  const [tab, setTab] = useState<SubTab>('Unassigned');

  const arrivalClusters = clusterArrivals(travelSegments);
  const departureClusters = clusterDepartures(travelSegments);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink">Assignments</h2>
        <p className="text-xs text-ink-faint mt-0.5">
          Arrivals and departures are clustered by location, date, and time window. Creating a route from a cluster is always a deliberate choice — nothing is auto-assigned.
        </p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-lg border border-line p-1 w-fit">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === t ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Unassigned' && <UnassignedPickupDropPanel />}
      {tab === 'Arrivals' && <ClusterPanel clusters={arrivalClusters} guests={guests} direction="Arrival" />}
      {tab === 'Departures' && <ClusterPanel clusters={departureClusters} guests={guests} direction="Departure" />}
      {tab === 'Shuttles' && <ShuttleAssignmentsPanel />}
    </div>
  );
}
