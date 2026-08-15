import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useGuests } from '@/hooks/useGuests';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { isTransportAssignmentActive } from '@/utils/transportLogic';
import {
  dropManifestCsvFilename,
  dropManifestToCSV,
  pickupManifestCsvFilename,
  pickupManifestToCSV,
} from '@/data/repositories/backupRepository';
import { downloadTextFile } from '@/utils/download';
import type { TransportAssignment, TransportRoute } from '@/types';

function ManifestTable({
  title,
  assignments,
  routes,
  onDownload,
}: {
  title: string;
  assignments: TransportAssignment[];
  routes: TransportRoute[];
  onDownload: () => void;
}) {
  const { guests } = useGuests();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const routeById = new Map(routes.map((r) => [r.id, r]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const driverById = new Map(drivers.map((d) => [d.id, d]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{assignments.length}</span>
          <Button variant="secondary" size="sm" icon={<Download className="size-4" aria-hidden="true" />} onClick={onDownload}>
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {assignments.length === 0 ? (
          <EmptyState title="Nothing on this manifest yet" description="Assignments for matching routes will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Date / Time</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Driver</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  const route = routeById.get(assignment.routeId);
                  const vehicle = route?.vehicleId ? vehicleById.get(route.vehicleId) : undefined;
                  const driver = route?.driverId ? driverById.get(route.driverId) : undefined;
                  return (
                    <tr key={assignment.id} className="border-b border-line-soft last:border-0">
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{guestById.get(assignment.guestId)?.fullName ?? 'Unknown guest'}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{route?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                        {assignment.pickupDate ?? route?.plannedDepartureDate ?? '—'} {assignment.pickupTime ?? route?.plannedDepartureTime ?? ''}
                      </td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{vehicle?.name ?? 'Unassigned'}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{driver?.name ?? 'Unassigned'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function ManifestsPanel() {
  const { guests } = useGuests();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();

  const routeById = new Map(routes.map((r) => [r.id, r]));
  const active = transportAssignments.filter(isTransportAssignmentActive);
  const pickupAssignments = active.filter((a) => routeById.get(a.routeId)?.routeType.includes('Pickup'));
  const dropAssignments = active.filter((a) => routeById.get(a.routeId)?.routeType.includes('Drop'));

  return (
    <div className="space-y-4">
      <ManifestTable
        title="Pickup manifest"
        assignments={pickupAssignments}
        routes={routes}
        onDownload={() => downloadTextFile(pickupManifestCsvFilename(), pickupManifestToCSV(transportAssignments, routes, guests, vehicles, drivers), 'text/csv')}
      />
      <ManifestTable
        title="Drop manifest"
        assignments={dropAssignments}
        routes={routes}
        onDownload={() => downloadTextFile(dropManifestCsvFilename(), dropManifestToCSV(transportAssignments, routes, guests, vehicles, drivers), 'text/csv')}
      />
    </div>
  );
}
