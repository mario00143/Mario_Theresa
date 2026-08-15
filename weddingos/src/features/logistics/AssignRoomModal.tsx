import { useMemo, useState } from 'react';
import type { Guest, Hotel, Room, RoomAssignment, RoomType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, Input, Label, Select } from '@/components/ui/Field';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTravel } from '@/hooks/useTravel';
import { RoomCapacityExceededError, OverlappingRoomAssignmentError } from '@/data/repositories/roomAssignmentRepository';

interface AssignRoomModalProps {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
  /** When set, the modal edits (moves) this existing assignment instead of creating a new one. */
  existingAssignment?: RoomAssignment;
  hotels: Hotel[];
  roomTypes: RoomType[];
  rooms: Room[];
}

export function AssignRoomModal({ open, onClose, guest, existingAssignment, hotels, roomTypes, rooms }: AssignRoomModalProps) {
  const { addRoomAssignment, updateRoomAssignment } = useRoomAssignments();
  const { travelSegments } = useTravel();

  const guestArrival = guest ? travelSegments.find((s) => s.guestId === guest.id && s.direction === 'Arrival') : undefined;
  const guestDeparture = guest ? travelSegments.find((s) => s.guestId === guest.id && s.direction === 'Departure') : undefined;

  const [roomId, setRoomId] = useState(existingAssignment?.roomId ?? '');
  const [checkInDate, setCheckInDate] = useState(existingAssignment?.checkInDate ?? guestArrival?.arrivalDate ?? '');
  const [checkOutDate, setCheckOutDate] = useState(existingAssignment?.checkOutDate ?? guestDeparture?.departureDate ?? '');
  const [accessibilityRequired, setAccessibilityRequired] = useState(existingAssignment?.accessibilityRequired ?? Boolean(guest?.accessibilityRequirements));
  const [extraBedRequired, setExtraBedRequired] = useState(existingAssignment?.extraBedRequired ?? false);
  const [childCotRequired, setChildCotRequired] = useState(existingAssignment?.childCotRequired ?? Boolean(guest?.infantRequirements));
  const [error, setError] = useState<string | null>(null);

  const roomsWithHotel = useMemo(
    () =>
      rooms.map((room) => {
        const hotel = hotels.find((h) => h.id === room.hotelId);
        const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);
        return { room, hotel, roomType };
      }),
    [rooms, hotels, roomTypes],
  );

  if (!guest) return null;

  const reset = () => {
    setRoomId(existingAssignment?.roomId ?? '');
    setCheckInDate(existingAssignment?.checkInDate ?? guestArrival?.arrivalDate ?? '');
    setCheckOutDate(existingAssignment?.checkOutDate ?? guestDeparture?.departureDate ?? '');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = roomId.length > 0 && checkInDate.length > 0 && checkOutDate.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    setError(null);
    try {
      if (existingAssignment) {
        updateRoomAssignment(existingAssignment.id, {
          roomId,
          checkInDate,
          checkOutDate,
          accessibilityRequired,
          extraBedRequired,
          childCotRequired,
        });
      } else {
        addRoomAssignment({
          roomId,
          guestId: guest.id,
          householdId: guest.householdId,
          checkInDate,
          checkOutDate,
          assignmentStatus: 'Confirmed',
          primaryOccupant: false,
          extraBedRequired,
          childCotRequired,
          accessibilityRequired,
        });
      }
      handleClose();
    } catch (err) {
      if (err instanceof RoomCapacityExceededError) {
        setError(`This room's capacity is ${err.capacity}, but this assignment would bring it to ${err.attemptedOccupants} occupant(s). Choose a different room or increase the room's capacity deliberately.`);
      } else if (err instanceof OverlappingRoomAssignmentError) {
        setError('This guest already has a room assignment overlapping these dates.');
      } else {
        setError('Could not save this assignment.');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={existingAssignment ? `Move ${guest.fullName}` : `Assign a room for ${guest.fullName}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            {existingAssignment ? 'Save' : 'Assign Room'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field>
          <Label htmlFor="assign-room" required>
            Room
          </Label>
          <Select id="assign-room" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Select a room…</option>
            {roomsWithHotel.map(({ room, hotel, roomType }) => (
              <option key={room.id} value={room.id}>
                {hotel?.name ?? 'Unknown hotel'} — Room {room.roomNumber} ({roomType?.name ?? 'Unknown type'})
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="assign-checkin" required>
              Check-in
            </Label>
            <Input id="assign-checkin" type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="assign-checkout" required>
              Check-out
            </Label>
            <Input id="assign-checkout" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={accessibilityRequired} onChange={(e) => setAccessibilityRequired(e.target.checked)} className="size-4 accent-brand-700" />
            Accessibility required
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={extraBedRequired} onChange={(e) => setExtraBedRequired(e.target.checked)} className="size-4 accent-brand-700" />
            Extra bed
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={childCotRequired} onChange={(e) => setChildCotRequired(e.target.checked)} className="size-4 accent-brand-700" />
            Child cot
          </label>
        </div>
        <FieldError>{error}</FieldError>
      </div>
    </Modal>
  );
}
