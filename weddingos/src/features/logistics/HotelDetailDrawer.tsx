import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Hotel } from '@/types';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useHotels } from '@/hooks/useHotels';
import { RoomTypesAndRoomsSection } from './RoomTypesAndRooms';

interface HotelDetailDrawerProps {
  hotelId: string | null;
  onClose: () => void;
}

export function HotelDetailDrawer({ hotelId, onClose }: HotelDetailDrawerProps) {
  const { hotels, updateHotel, deleteHotel } = useHotels();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hotel = hotels.find((h: Hotel) => h.id === hotelId);

  if (!hotelId) return null;

  if (!hotel) {
    return (
      <Drawer open onClose={onClose} title="Hotel not found">
        <p className="text-sm text-ink-faint">This hotel may have been deleted.</p>
      </Drawer>
    );
  }

  const handleDelete = () => {
    deleteHotel(hotel.id);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={hotel.name}
        subtitle={<span className="text-xs text-ink-faint">{hotel.area ? `${hotel.area}, ` : ''}{hotel.city}</span>}
        footer={
          <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
            Delete hotel
          </Button>
        }
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-sm font-semibold text-ink">Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="h-name" required>
                  Name
                </Label>
                <Input id="h-name" defaultValue={hotel.name} key={`name-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { name: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="h-city" required>
                  City
                </Label>
                <Input id="h-city" defaultValue={hotel.city} key={`city-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { city: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="h-area">Area</Label>
                <Input id="h-area" defaultValue={hotel.area ?? ''} key={`area-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { area: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="h-address">Address</Label>
                <Input id="h-address" defaultValue={hotel.address ?? ''} key={`address-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { address: e.target.value || undefined })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="h-contact">Primary contact</Label>
                <Input id="h-contact" defaultValue={hotel.primaryContact ?? ''} key={`contact-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { primaryContact: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="h-phone">Phone</Label>
                <Input id="h-phone" defaultValue={hotel.phone ?? ''} key={`phone-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { phone: e.target.value || undefined })} />
              </Field>
            </div>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Check-in / check-out</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="h-checkin">Check-in time</Label>
                <Input id="h-checkin" type="time" value={hotel.checkInTime ?? ''} onChange={(e) => updateHotel(hotel.id, { checkInTime: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="h-checkout">Check-out time</Label>
                <Input id="h-checkout" type="time" value={hotel.checkOutTime ?? ''} onChange={(e) => updateHotel(hotel.id, { checkOutTime: e.target.value || undefined })} />
              </Field>
            </div>
            <Field>
              <Label htmlFor="h-early">Early check-in policy</Label>
              <Input id="h-early" defaultValue={hotel.earlyCheckInPolicy ?? ''} key={`early-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { earlyCheckInPolicy: e.target.value || undefined })} />
            </Field>
            <Field>
              <Label htmlFor="h-late">Late checkout policy</Label>
              <Input id="h-late" defaultValue={hotel.lateCheckoutPolicy ?? ''} key={`late-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { lateCheckoutPolicy: e.target.value || undefined })} />
            </Field>
            <FieldHint>Used to flag early-arrival and late-departure guests against this hotel's posted times.</FieldHint>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Facilities</p>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={hotel.breakfastIncluded} onChange={(e) => updateHotel(hotel.id, { breakfastIncluded: e.target.checked })} className="size-4 accent-brand-700" />
                Breakfast included
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={hotel.parkingAvailable} onChange={(e) => updateHotel(hotel.id, { parkingAvailable: e.target.checked })} className="size-4 accent-brand-700" />
                Parking available
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={hotel.busAccess} onChange={(e) => updateHotel(hotel.id, { busAccess: e.target.checked })} className="size-4 accent-brand-700" />
                Coach / bus access
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={hotel.accessibleRoomsAvailable}
                  onChange={(e) => updateHotel(hotel.id, { accessibleRoomsAvailable: e.target.checked })}
                  className="size-4 accent-brand-700"
                />
                Accessible rooms available
              </label>
            </div>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <Field>
              <Label htmlFor="h-notes">Notes</Label>
              <Textarea id="h-notes" defaultValue={hotel.notes ?? ''} key={`notes-${hotel.id}`} onBlur={(e) => updateHotel(hotel.id, { notes: e.target.value || undefined })} />
            </Field>
          </section>

          <div className="border-t border-line-soft pt-5">
            <RoomTypesAndRoomsSection hotelId={hotel.id} />
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete hotel"
        message={`Delete "${hotel.name}"? All its room types, rooms, and room assignments will also be removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
