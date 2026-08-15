import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useUI } from '@/context/UIContext';
import { buildPickupExceptionReport } from '@/utils/logisticsReports';

export function PickupExceptionReportPanel() {
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { transportAssignments } = useTransportAssignments();
  const { routes } = useTransportRoutes();
  const { openTravelDetail } = useUI();

  const rows = buildPickupExceptionReport(travelSegments, guests, transportAssignments, routes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup exceptions</CardTitle>
        <Badge tone={rows.length > 0 ? 'critical' : 'success'}>{rows.length}</Badge>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No pickup exceptions" description="Every requested pickup has a route, vehicle, and driver." />
        ) : (
          <ul className="divide-y divide-line-soft">
            {rows.map((row) => (
              <li key={row.segment.id}>
                <button type="button" onClick={() => openTravelDetail(row.segment.id)} className="flex w-full items-start justify-between gap-2.5 px-4 py-3 text-left hover:bg-surface-subtle">
                  <div>
                    <p className="text-sm font-medium text-ink">{row.guest.fullName}</p>
                    <p className="text-xs text-ink-faint">
                      {row.segment.origin} → {row.segment.destination}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {row.reasons.map((reason) => (
                      <Badge key={reason} tone="critical">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
