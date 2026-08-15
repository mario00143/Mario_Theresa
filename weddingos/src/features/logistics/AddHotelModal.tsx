import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label } from '@/components/ui/Field';
import { useHotels } from '@/hooks/useHotels';

interface AddHotelModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (hotelId: string) => void;
}

export function AddHotelModal({ open, onClose, onCreated }: AddHotelModalProps) {
  const { addHotel } = useHotels();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');

  const reset = () => {
    setName('');
    setArea('');
    setCity('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = name.trim().length > 0 && city.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const hotel = addHotel({
      name: name.trim(),
      area: area.trim(),
      city: city.trim(),
      breakfastIncluded: false,
      parkingAvailable: false,
      busAccess: false,
      accessibleRoomsAvailable: false,
    });
    handleClose();
    onCreated(hotel.id);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Hotel"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            Create Hotel
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field>
          <Label htmlFor="add-hotel-name" required>
            Hotel name
          </Label>
          <Input id="add-hotel-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marigold Grand Hyderabad" autoFocus />
        </Field>
        <Field>
          <Label htmlFor="add-hotel-area">Area</Label>
          <Input id="add-hotel-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Banjara Hills" />
        </Field>
        <Field>
          <Label htmlFor="add-hotel-city" required>
            City
          </Label>
          <Input id="add-hotel-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Hyderabad" />
        </Field>
        <p className="text-xs text-ink-faint">City is free text — add hotels for any location, not just Hyderabad. You can add room types and rooms right after creating this hotel.</p>
      </div>
    </Modal>
  );
}
