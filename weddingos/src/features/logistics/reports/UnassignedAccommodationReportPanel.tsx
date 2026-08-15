import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTravel } from '@/hooks/useTravel';
import { useUI } from '@/context/UIContext';
import { buildUnassignedAccommodationReport } from '@/utils/logisticsReports';
import { formatDisplayDate } from '@/utils/date';

export function UnassignedAccommodationReportPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { roomAssignments } = useRoomAssignments();
  const { travelSegments } = useTravel();
  const { openGuestDetail } = useUI();

  const rows = buildUnassignedAccommodationReport(guests, households, roomAssignments, travelSegments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unassigned accommodation</CardTitle>
        <Badge tone={rows.length > 0 ? 'critical' : 'success'}>{rows.length}</Badge>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="Everyone who needs a room has one" description="No unassigned accommodation requirements." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Household</th>
                  <th className="px-4 py-3">Arrival</th>
                  <th className="px-4 py-3">Departure</th>
                  <th className="px-4 py-3">Requirements</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} onClick={() => openGuestDetail(row.guest.id)} className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.guest.fullName}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.household?.householdName ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDisplayDate(row.arrivalDate)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDisplayDate(row.departureDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {row.requirements.map((r) => (
                          <Badge key={r} tone="warning">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
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
