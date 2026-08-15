import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useUI } from '@/context/UIContext';
import { buildDepartureReport } from '@/utils/logisticsReports';
import { formatDisplayDate } from '@/utils/date';

export function DepartureReportPanel() {
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { transportAssignments } = useTransportAssignments();
  const { openTravelDetail } = useUI();

  const rows = buildDepartureReport(travelSegments, guests, transportAssignments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departure report</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No departures on file" description="Add travel segments to see departures here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Departure</th>
                  <th className="px-4 py-3">Drop</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const segmentId = travelSegments.find((s) => s.guestId === row.guest.id && s.direction === 'Departure')?.id;
                  return (
                    <tr key={i} onClick={() => segmentId && openTravelDetail(segmentId)} className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle">
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.guest.fullName}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.mode}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.service || '—'}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                        {formatDisplayDate(row.departureDate)} {row.departureTime ?? ''}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.dropRequired ? <Badge tone={row.dropAssignmentStatus === 'Unassigned' ? 'critical' : 'success'}>{row.dropAssignmentStatus}</Badge> : <span className="text-ink-faint text-xs">Not required</span>}
                      </td>
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
