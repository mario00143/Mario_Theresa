import { useState } from 'react';
import type { Guest, Hotel, Household, Room, RoomAssignment, RoomType } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getRoomCapacity, isRoomAssignmentActive } from '@/utils/roomLogic';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';

interface HotelRoomsPanelProps {
  hotels: Hotel[];
  roomTypes: RoomType[];
  rooms: Room[];
  roomAssignments: RoomAssignment[];
  guests: Guest[];
  households: Household[];
  onMove: (assignment: RoomAssignment, guest: Guest) => void;
}

export function HotelRoomsPanel({ hotels, roomTypes, rooms, roomAssignments, guests, households, onMove }: HotelRoomsPanelProps) {
  const { deleteRoomAssignment } = useRoomAssignments();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const householdById = new Map(households.map((h) => [h.id, h]));
  const roomTypeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
  const activeAssignments = roomAssignments.filter(isRoomAssignmentActive);

  return (
    <div className="space-y-4">
      {hotels.map((hotel) => {
        const hotelRooms = rooms.filter((r) => r.hotelId === hotel.id);
        return (
          <Card key={hotel.id}>
            <CardHeader>
              <CardTitle>{hotel.name}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {hotelRooms.length === 0 && <p className="text-xs text-ink-faint">No rooms set up yet for this hotel.</p>}
              {hotelRooms.map((room) => {
                const roomType = roomTypeById.get(room.roomTypeId);
                const capacity = getRoomCapacity(room, roomType);
                const occupants = activeAssignments.filter((a) => a.roomId === room.id);
                const overCapacity = occupants.length > capacity;
                return (
                  <div key={room.id} className={`rounded-lg border p-3 ${overCapacity ? 'border-critical/50 bg-critical-bg' : 'border-line-soft'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        Room {room.roomNumber} <span className="text-xs text-ink-faint">({roomType?.name ?? 'Unknown type'})</span>
                      </p>
                      <Badge tone={overCapacity ? 'critical' : occupants.length === capacity ? 'warning' : 'neutral'}>
                        {occupants.length}/{capacity}
                      </Badge>
                    </div>
                    {occupants.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {occupants.map((assignment) => {
                          const occupantGuest = guestById.get(assignment.guestId);
                          const household = occupantGuest ? householdById.get(occupantGuest.householdId) : undefined;
                          return (
                            <li key={assignment.id} className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-ink-soft truncate">
                                {occupantGuest?.fullName ?? 'Unknown guest'}
                                {household && <span className="text-ink-faint"> · {household.householdName}</span>}
                              </span>
                              <div className="flex shrink-0 gap-1">
                                <Button variant="ghost" size="sm" onClick={() => occupantGuest && onMove(assignment, occupantGuest)}>
                                  Move
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setConfirmRemoveId(assignment.id)}>
                                  Remove
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>
        );
      })}

      <ConfirmDialog
        open={confirmRemoveId !== null}
        title="Remove room assignment"
        message="Remove this guest from the room? This cannot be undone."
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (confirmRemoveId) deleteRoomAssignment(confirmRemoveId);
          setConfirmRemoveId(null);
        }}
        onCancel={() => setConfirmRemoveId(null)}
      />
    </div>
  );
}
