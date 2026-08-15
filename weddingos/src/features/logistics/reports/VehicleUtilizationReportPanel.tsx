import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useVehicles } from '@/hooks/useVehicles';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { buildVehicleUtilizationReport } from '@/utils/logisticsReports';
import { vehicleManifestCsvFilename, vehicleManifestToCSV } from '@/data/repositories/backupRepository';
import { downloadTextFile } from '@/utils/download';

export function VehicleUtilizationReportPanel() {
  const { vehicles } = useVehicles();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();

  const rows = buildVehicleUtilizationReport(vehicles, routes, transportAssignments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle utilization</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(vehicleManifestCsvFilename(), vehicleManifestToCSV(vehicles, routes, transportAssignments), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No vehicles yet" description="Add vehicles in the Transport tab to see utilization here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Seats assigned</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Routes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.vehicle.id} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.vehicle.name}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.capacity}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone={row.assignedSeats > row.capacity ? 'critical' : 'neutral'}>{row.assignedSeats}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.remainingSeats}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.routeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
