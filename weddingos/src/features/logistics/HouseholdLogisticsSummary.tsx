import type { Guest } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useTravel } from '@/hooks/useTravel';
import { useHotels } from '@/hooks/useHotels';
import { useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useUI } from '@/context/UIContext';
import { isRoomAssignmentActive } from '@/utils/roomLogic';
import { isTransportAssignmentActive } from '@/utils/transportLogic';
import { formatDisplayDate } from '@/utils/date';

export function HouseholdLogisticsSummary({ members }: { members: Guest[] }) {
  const { travelSegments } = useTravel();
  const { hotels } = useHotels();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { transportAssignments } = useTransportAssignments();
  const { openGuestDetail } = useUI();

  if (members.length === 0) {
    return <p className="text-sm text-ink-faint">No members to show logistics for yet.</p>;
  }

  const hotelNames = new Set<string>();
  const rows = members.map((guest) => {
    const arrival = travelSegments.find((s) => s.guestId === guest.id && s.direction === 'Arrival');
    const activeAssignment = roomAssignments.filter((a) => a.guestId === guest.id).find(isRoomAssignmentActive);
    const room = activeAssignment ? rooms.find((r) => r.id === activeAssignment.roomId) : undefined;
    const hotel = room ? hotels.find((h) => h.id === room.hotelId) : undefined;
    if (hotel) hotelNames.add(hotel.name);
    const hasTransport = transportAssignments.some((a) => a.guestId === guest.id && isTransportAssignmentActive(a));
    return { guest, arrival, hotel, room, hasTransport };
  });

  const travellingCount = rows.filter((r) => r.arrival).length;
  const stayingTogether = hotelNames.size <= 1 && hotelNames.size > 0 && rows.some((r) => r.hotel);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{travellingCount}/{members.length} travelling</Badge>
        {hotelNames.size > 0 && <Badge tone={stayingTogether ? 'success' : 'warning'}>{stayingTogether ? 'Family staying together' : `Split across ${hotelNames.size} hotels`}</Badge>}
      </div>
      <ul className="space-y-1.5">
        {rows.map(({ guest, arrival, hotel, room, hasTransport }) => (
          <li key={guest.id}>
            <button
              type="button"
              onClick={() => openGuestDetail(guest.id)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-line-soft px-3 py-2 text-left hover:bg-surface-subtle"
            >
              <span className="text-sm text-ink truncate">{guest.fullName}</span>
              <span className="flex flex-wrap items-center justify-end gap-1.5 text-xs text-ink-faint shrink-0">
                {arrival ? `Arrives ${formatDisplayDate(arrival.arrivalDate)}` : 'No travel'}
                {hotel && room && <Badge tone="info">{hotel.name} · {room.roomNumber}</Badge>}
                {hasTransport && <Badge tone="success">Transport set</Badge>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
