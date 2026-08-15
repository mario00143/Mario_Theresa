import { useState } from 'react';
import type { AccommodationQueueEntry } from '@/utils/logisticsStats';
import type { Guest, RoomAssignment } from '@/types';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useHotels } from '@/hooks/useHotels';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTravel } from '@/hooks/useTravel';
import { computeAccommodationQueue } from '@/utils/logisticsStats';
import { AccommodationQueue } from './AccommodationQueue';
import { HotelRoomsPanel } from './HotelRoomsPanel';
import { AssignRoomModal } from './AssignRoomModal';

export function RoomsView() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { hotels } = useHotels();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { travelSegments } = useTravel();

  const queue = computeAccommodationQueue(guests, households, roomAssignments, travelSegments);

  const [assignTarget, setAssignTarget] = useState<{ guest: Guest; existingAssignment?: RoomAssignment } | null>(null);

  const handleAssignFromQueue = (entry: AccommodationQueueEntry) => {
    setAssignTarget({ guest: entry.guest });
  };

  const handleMove = (assignment: RoomAssignment, guest: Guest) => {
    setAssignTarget({ guest, existingAssignment: assignment });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-ink">Room allocation</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AccommodationQueue entries={queue} onAssign={handleAssignFromQueue} />
        <HotelRoomsPanel
          hotels={hotels}
          roomTypes={roomTypes}
          rooms={rooms}
          roomAssignments={roomAssignments}
          guests={guests}
          households={households}
          onMove={handleMove}
        />
      </div>

      <AssignRoomModal
        open={assignTarget !== null}
        onClose={() => setAssignTarget(null)}
        guest={assignTarget?.guest ?? null}
        existingAssignment={assignTarget?.existingAssignment}
        hotels={hotels}
        roomTypes={roomTypes}
        rooms={rooms}
      />
    </div>
  );
}
