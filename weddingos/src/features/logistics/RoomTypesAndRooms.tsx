import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Room, RoomStatus, RoomType } from '@/types';
import { ROOM_STATUSES } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';

function RoomTypeRow({ roomType }: { roomType: RoomType }) {
  const { updateRoomType, deleteRoomType } = useRoomTypes();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <Input
          defaultValue={roomType.name}
          key={`rt-name-${roomType.id}`}
          onBlur={(e) => updateRoomType(roomType.id, { name: e.target.value })}
          className="font-medium"
          aria-label="Room type name"
        />
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete room type "${roomType.name}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`rt-cap-${roomType.id}`}>Capacity</Label>
          <Input
            id={`rt-cap-${roomType.id}`}
            type="number"
            min={1}
            defaultValue={roomType.capacity}
            key={`rt-cap-${roomType.id}-${roomType.capacity}`}
            onBlur={(e) => updateRoomType(roomType.id, { capacity: Number(e.target.value) || 1 })}
          />
        </Field>
        <Field>
          <Label htmlFor={`rt-occ-${roomType.id}`}>Standard occupancy</Label>
          <Input
            id={`rt-occ-${roomType.id}`}
            type="number"
            min={1}
            defaultValue={roomType.standardOccupancy}
            key={`rt-occ-${roomType.id}-${roomType.standardOccupancy}`}
            onBlur={(e) => updateRoomType(roomType.id, { standardOccupancy: Number(e.target.value) || 1 })}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input type="checkbox" checked={roomType.extraBedAllowed} onChange={(e) => updateRoomType(roomType.id, { extraBedAllowed: e.target.checked })} className="size-3.5 accent-brand-700" />
          Extra bed allowed
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input type="checkbox" checked={roomType.childCotAllowed} onChange={(e) => updateRoomType(roomType.id, { childCotAllowed: e.target.checked })} className="size-3.5 accent-brand-700" />
          Child cot allowed
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input type="checkbox" checked={roomType.accessible} onChange={(e) => updateRoomType(roomType.id, { accessible: e.target.checked })} className="size-3.5 accent-brand-700" />
          Accessible
        </label>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete room type"
        message={`Delete "${roomType.name}"? Its rooms and any room assignments in those rooms will also be removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteRoomType(roomType.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function RoomRow({ room, roomTypes }: { room: Room; roomTypes: RoomType[] }) {
  const { updateRoom, deleteRoom } = useRooms();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line-soft px-3 py-2">
      <Input
        defaultValue={room.roomNumber}
        key={`room-number-${room.id}`}
        onBlur={(e) => updateRoom(room.id, { roomNumber: e.target.value })}
        className="w-24"
        aria-label="Room number"
      />
      <Select value={room.roomTypeId} onChange={(e) => updateRoom(room.id, { roomTypeId: e.target.value })} className="w-auto! min-w-[10rem]" aria-label="Room type">
        {roomTypes.map((rt) => (
          <option key={rt.id} value={rt.id}>
            {rt.name}
          </option>
        ))}
      </Select>
      <Input
        defaultValue={room.floor ?? ''}
        key={`room-floor-${room.id}`}
        placeholder="Floor"
        onBlur={(e) => updateRoom(room.id, { floor: e.target.value || undefined })}
        className="w-24"
        aria-label="Floor"
      />
      <Select value={room.status} onChange={(e) => updateRoom(room.id, { status: e.target.value as RoomStatus })} className="w-auto! min-w-[9rem]" aria-label="Room status">
        {ROOM_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Input
        type="number"
        min={0}
        defaultValue={room.capacityOverride ?? ''}
        key={`room-cap-override-${room.id}`}
        placeholder={`Cap. ${roomType?.capacity ?? ''}`}
        onBlur={(e) => updateRoom(room.id, { capacityOverride: e.target.value === '' ? undefined : Number(e.target.value) })}
        className="w-24"
        aria-label="Capacity override"
      />
      {roomType && room.capacityOverride !== undefined && room.capacityOverride < roomType.capacity && (
        <Badge tone="warning">Reduced capacity</Badge>
      )}
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        aria-label={`Delete room ${room.roomNumber}`}
        className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete room"
        message={`Delete room ${room.roomNumber}? Any room assignments for this room will also be removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteRoom(room.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function RoomTypesAndRoomsSection({ hotelId }: { hotelId: string }) {
  const { roomTypes: allRoomTypes, addRoomType } = useRoomTypes();
  const { rooms: allRooms, addRoom } = useRooms();
  const roomTypes = allRoomTypes.filter((rt) => rt.hotelId === hotelId);
  const rooms = allRooms.filter((r) => r.hotelId === hotelId);

  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomTypeId, setNewRoomTypeId] = useState(roomTypes[0]?.id ?? '');

  const handleAddRoomType = () => {
    if (!newRoomTypeName.trim()) return;
    addRoomType({
      hotelId,
      name: newRoomTypeName.trim(),
      capacity: 2,
      standardOccupancy: 2,
      extraBedAllowed: false,
      childCotAllowed: false,
      accessible: false,
    });
    setNewRoomTypeName('');
  };

  const handleAddRoom = () => {
    const roomTypeId = newRoomTypeId || roomTypes[0]?.id;
    if (!newRoomNumber.trim() || !roomTypeId) return;
    addRoom({ hotelId, roomTypeId, roomNumber: newRoomNumber.trim(), status: 'Available' });
    setNewRoomNumber('');
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm font-semibold text-ink">Room types</p>
        {roomTypes.length === 0 && <p className="text-xs text-ink-faint">No room types yet.</p>}
        <div className="space-y-2.5">
          {roomTypes.map((rt) => (
            <RoomTypeRow key={rt.id} roomType={rt} />
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newRoomTypeName} onChange={(e) => setNewRoomTypeName(e.target.value)} placeholder="New room type name…" aria-label="New room type name" />
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddRoomType} disabled={!newRoomTypeName.trim()}>
            Add
          </Button>
        </div>
      </section>

      <section className="space-y-3 border-t border-line-soft pt-5">
        <p className="text-sm font-semibold text-ink">Rooms</p>
        {rooms.length === 0 && <p className="text-xs text-ink-faint">No rooms yet.</p>}
        <div className="space-y-2">
          {rooms.map((room) => (
            <RoomRow key={room.id} room={room} roomTypes={roomTypes} />
          ))}
        </div>
        {roomTypes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Input value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} placeholder="New room number…" className="w-32" aria-label="New room number" />
            <Select value={newRoomTypeId || roomTypes[0]?.id} onChange={(e) => setNewRoomTypeId(e.target.value)} className="w-auto! min-w-[10rem]" aria-label="New room's room type">
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </Select>
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddRoom} disabled={!newRoomNumber.trim()}>
              Add
            </Button>
          </div>
        ) : (
          <p className="text-xs text-ink-faint">Add a room type before adding rooms.</p>
        )}
      </section>
    </div>
  );
}
