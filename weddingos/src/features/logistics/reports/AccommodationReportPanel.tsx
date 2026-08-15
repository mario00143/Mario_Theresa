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
import { useUI } from '@/context/UIContext';
import { buildAccommodationReport } from '@/utils/logisticsReports';
import { roomAssignmentsCsvFilename, roomAssignmentsToCSV } from '@/data/repositories/backupRepository';
import { downloadTextFile } from '@/utils/download';
import { formatDisplayDate } from '@/utils/date';

export function AccommodationReportPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { hotels } = useHotels();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { openGuestDetail } = useUI();

  const rows = buildAccommodationReport(roomAssignments, households, guests, rooms, roomTypes, hotels);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accommodation report</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(roomAssignmentsCsvFilename(), roomAssignmentsToCSV(roomAssignments, guests, rooms, roomTypes, hotels), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No room assignments yet" description="Assign guests to rooms from the Rooms tab." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Household</th>
                  <th className="px-4 py-3">Hotel</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Check-out</th>
                  <th className="px-4 py-3">Needs</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} onClick={() => openGuestDetail(row.guest.id)} className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.guest.fullName}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.household?.householdName ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.hotel?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.room?.roomNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDisplayDate(row.checkInDate)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatDisplayDate(row.checkOutDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {row.accessibilityRequired && <Badge tone="warning">Accessible</Badge>}
                        {row.extraBedRequired && <Badge tone="info">Extra bed</Badge>}
                        {row.childCotRequired && <Badge tone="info">Cot</Badge>}
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
