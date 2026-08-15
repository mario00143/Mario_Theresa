import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { useGuest, useGuests } from '@/hooks/useGuests';
import { useTravelForGuest } from '@/hooks/useTravel';
import { useRoomAssignmentsForGuest } from '@/hooks/useRoomAssignments';
import { useTransportAssignmentsForGuest } from '@/hooks/useTransportAssignments';
import { useHotels } from '@/hooks/useHotels';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useUI } from '@/context/UIContext';
import { isRoomAssignmentActive } from '@/utils/roomLogic';
import { isTransportAssignmentActive } from '@/utils/transportLogic';
import { formatDisplayDate } from '@/utils/date';
import { TravelBookingStatusBadge } from './LogisticsBadges';
import { AddTravelModal } from './AddTravelModal';
import { AssignRoomModal } from './AssignRoomModal';
import { AssignTransportModal } from './AssignTransportModal';

const SHUTTLE_TYPES = ['Church Shuttle', 'Reception Shuttle'];

export function GuestLogisticsSection({ guestId }: { guestId: string }) {
  const { guests } = useGuests();
  const guest = useGuest(guestId);
  const { openTravelDetail } = useUI();
  const segments = useTravelForGuest(guestId);
  const roomAssignments = useRoomAssignmentsForGuest(guestId);
  const transportAssignments = useTransportAssignmentsForGuest(guestId);
  const { hotels } = useHotels();
  const { rooms } = useRooms();
  const { roomTypes } = useRoomTypes();
  const { routes } = useTransportRoutes();

  const [addTravelOpen, setAddTravelOpen] = useState(false);
  const [assignRoomOpen, setAssignRoomOpen] = useState(false);
  const [assignPickupOpen, setAssignPickupOpen] = useState(false);
  const [assignDropOpen, setAssignDropOpen] = useState(false);

  if (!guest) return null;

  const arrival = segments.find((s) => s.direction === 'Arrival');
  const departure = segments.find((s) => s.direction === 'Departure');
  const activeRoomAssignment = roomAssignments.find(isRoomAssignmentActive);
  const room = activeRoomAssignment ? rooms.find((r) => r.id === activeRoomAssignment.roomId) : undefined;
  const hotel = room ? hotels.find((h) => h.id === room.hotelId) : undefined;
  const activeTransport = transportAssignments.filter(isTransportAssignmentActive);
  const pickupAssignment = activeTransport.find((a) => a.travelSegmentId === arrival?.id);
  const dropAssignment = activeTransport.find((a) => a.travelSegmentId === departure?.id);
  const shuttleAssignments = activeTransport.filter((a) => {
    const route = routes.find((r) => r.id === a.routeId);
    return route && SHUTTLE_TYPES.includes(route.routeType) && a.id !== pickupAssignment?.id && a.id !== dropAssignment?.id;
  });

  const routeName = (routeId: string) => routes.find((r) => r.id === routeId)?.name ?? 'Unknown route';

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-line-soft p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Travel</p>
          <button type="button" onClick={() => setAddTravelOpen(true)} className="text-xs text-brand-700 hover:underline">
            Add Travel
          </button>
        </div>
        {segments.length === 0 ? (
          <p className="text-xs text-ink-faint">No travel segments recorded yet.</p>
        ) : (
          segments.map((segment) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => openTravelDetail(segment.id)}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-subtle"
            >
              <span className="text-xs text-ink-soft">
                {segment.direction} · {segment.origin} → {segment.destination}
                {segment.direction === 'Arrival' && segment.arrivalDate ? ` · ${formatDisplayDate(segment.arrivalDate)}` : ''}
                {segment.direction === 'Departure' && segment.departureDate ? ` · ${formatDisplayDate(segment.departureDate)}` : ''}
              </span>
              <TravelBookingStatusBadge status={segment.bookingStatus} />
            </button>
          ))
        )}
      </div>

      <div className="rounded-lg border border-line-soft p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Accommodation</p>
          <button type="button" onClick={() => setAssignRoomOpen(true)} className="text-xs text-brand-700 hover:underline">
            {activeRoomAssignment ? 'Move Room' : 'Assign Room'}
          </button>
        </div>
        {hotel && room ? (
          <p className="text-xs text-ink-soft">
            {hotel.name} — Room {room.roomNumber}
            {activeRoomAssignment && ` · ${formatDisplayDate(activeRoomAssignment.checkInDate)} to ${formatDisplayDate(activeRoomAssignment.checkOutDate)}`}
          </p>
        ) : (
          <p className="text-xs text-ink-faint">{guest.accommodationRequired ? 'Accommodation required but no room assigned.' : 'No accommodation on file.'}</p>
        )}
      </div>

      <div className="rounded-lg border border-line-soft p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Pickup</p>
          {arrival && (
            <button type="button" onClick={() => setAssignPickupOpen(true)} className="text-xs text-brand-700 hover:underline">
              {pickupAssignment ? 'Change Pickup' : 'Assign Pickup'}
            </button>
          )}
        </div>
        {pickupAssignment ? (
          <p className="text-xs text-ink-soft">{routeName(pickupAssignment.routeId)}</p>
        ) : (
          <p className="text-xs text-ink-faint">{arrival?.pickupRequired ? 'Pickup required but not yet assigned.' : 'No pickup required.'}</p>
        )}
      </div>

      <div className="rounded-lg border border-line-soft p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Drop</p>
          {departure && (
            <button type="button" onClick={() => setAssignDropOpen(true)} className="text-xs text-brand-700 hover:underline">
              {dropAssignment ? 'Change Drop' : 'Assign Drop'}
            </button>
          )}
        </div>
        {dropAssignment ? (
          <p className="text-xs text-ink-soft">{routeName(dropAssignment.routeId)}</p>
        ) : (
          <p className="text-xs text-ink-faint">{departure?.dropRequired ? 'Drop required but not yet assigned.' : 'No drop required.'}</p>
        )}
      </div>

      {shuttleAssignments.length > 0 && (
        <div className="rounded-lg border border-line-soft p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Wedding-day shuttles</p>
          <div className="flex flex-wrap gap-1.5">
            {shuttleAssignments.map((a) => (
              <Badge key={a.id} tone="info">
                {routeName(a.routeId)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <AddTravelModal open={addTravelOpen} onClose={() => setAddTravelOpen(false)} guests={guests} presetGuestId={guestId} />
      <AssignRoomModal
        open={assignRoomOpen}
        onClose={() => setAssignRoomOpen(false)}
        guest={guest}
        existingAssignment={activeRoomAssignment}
        hotels={hotels}
        roomTypes={roomTypes}
        rooms={rooms}
      />
      <AssignTransportModal
        open={assignPickupOpen}
        onClose={() => setAssignPickupOpen(false)}
        guest={guest}
        segment={arrival}
        routes={routes.filter((r) => r.routeType.includes('Pickup'))}
      />
      <AssignTransportModal
        open={assignDropOpen}
        onClose={() => setAssignDropOpen(false)}
        guest={guest}
        segment={departure}
        routes={routes.filter((r) => r.routeType.includes('Drop'))}
      />
    </div>
  );
}
