import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useHotels } from '@/hooks/useHotels';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useGuests } from '@/hooks/useGuests';
import { buildRoomOccupancyReport } from '@/utils/logisticsReports';

export function RoomOccupancyReportPanel() {
  const { hotels } = useHotels();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { guests } = useGuests();

  const rows = buildRoomOccupancyReport(hotels, rooms, roomTypes, roomAssignments, guests);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room occupancy</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No rooms yet" description="Add rooms in the Hotels tab to see occupancy here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Hotel</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Occupants</th>
                  <th className="px-4 py-3">Occupancy</th>
                  <th className="px-4 py-3">Available</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.hotel.name}</td>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.room.roomNumber}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.roomType?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft max-w-[16rem] truncate">{row.occupantNames.join(', ') || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone={row.occupantCount > row.capacity ? 'critical' : row.occupantCount === row.capacity ? 'warning' : 'neutral'}>
                        {row.occupantCount}/{row.capacity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.availableSpaces}</td>
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
