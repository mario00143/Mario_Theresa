import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useHotels } from '@/hooks/useHotels';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTravel } from '@/hooks/useTravel';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useUI } from '@/context/UIContext';
import { buildArrivalReport } from '@/utils/logisticsReports';
import { travelCsvFilename, travelToCSV } from '@/data/repositories/backupRepository';
import { downloadTextFile } from '@/utils/download';
import { formatDisplayDate } from '@/utils/date';

export function ArrivalReportPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { hotels } = useHotels();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { travelSegments } = useTravel();
  const { transportAssignments } = useTransportAssignments();
  const { openTravelDetail } = useUI();

  const rows = buildArrivalReport(travelSegments, households, guests, rooms, roomTypes, hotels, roomAssignments, transportAssignments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrival report</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button variant="secondary" size="sm" icon={<Download className="size-4" aria-hidden="true" />} onClick={() => downloadTextFile(travelCsvFilename(), travelToCSV(travelSegments, guests, households), 'text/csv')}>
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No arrivals on file" description="Add travel segments to see arrivals here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Arrival</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3">Hotel / Room</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const segmentId = travelSegments.find((s) => s.guestId === row.guest.id && s.direction === 'Arrival')?.id;
                  return (
                  <tr key={i} onClick={() => segmentId && openTravelDetail(segmentId)} className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.guest.fullName}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.origin}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.mode}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                      {formatDisplayDate(row.arrivalDate)} {row.arrivalTime ?? ''}
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.arrivalLocation}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.pickupRequired ? <Badge tone={row.pickupAssignmentStatus === 'Unassigned' ? 'critical' : 'success'}>{row.pickupAssignmentStatus}</Badge> : <span className="text-ink-faint text-xs">Not required</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                      {row.hotel ? `${row.hotel.name}${row.roomNumber ? ` · ${row.roomNumber}` : ''}` : '—'}
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
