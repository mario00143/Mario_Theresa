import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { buildDriverDirectory } from '@/utils/logisticsReports';
import { driverDirectoryCsvFilename, driverDirectoryToCSV } from '@/data/repositories/backupRepository';
import { downloadTextFile } from '@/utils/download';

export function DriverDirectoryReportPanel() {
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();
  const { routes } = useTransportRoutes();

  const rows = buildDriverDirectory(drivers, vehicles, routes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver directory</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(driverDirectoryCsvFilename(), driverDirectoryToCSV(drivers, vehicles, routes), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No drivers yet" description="Add drivers in the Transport tab." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Active routes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.driver.id} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.driver.name}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.driver.phone}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.vehicle?.name ?? 'Unassigned'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.activeRouteCount}</td>
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
