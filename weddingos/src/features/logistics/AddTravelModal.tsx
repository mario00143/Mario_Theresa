import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { EVENTS, TRAVEL_DIRECTIONS, TRAVEL_MODES, type EventScope, type Guest, type TravelDirection, type TravelMode } from '@/types';
import { useTravel } from '@/hooks/useTravel';
import { useUI } from '@/context/UIContext';

interface AddTravelModalProps {
  open: boolean;
  onClose: () => void;
  guests: Guest[];
  /** Preselects a guest — used when opened from a Guest Detail "Add Travel" quick action. */
  presetGuestId?: string;
}

export function AddTravelModal({ open, onClose, guests, presetGuestId }: AddTravelModalProps) {
  const { addTravelSegment } = useTravel();
  const { openTravelDetail } = useUI();

  const [guestId, setGuestId] = useState(presetGuestId ?? '');
  const [event, setEvent] = useState<EventScope>('Wedding');
  const [direction, setDirection] = useState<TravelDirection>('Arrival');
  const [travelMode, setTravelMode] = useState<TravelMode>('Flight');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const reset = () => {
    setGuestId(presetGuestId ?? '');
    setEvent('Wedding');
    setDirection('Arrival');
    setTravelMode('Flight');
    setOrigin('');
    setDestination('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const guestOptions = presetGuestId ? guests.filter((g) => g.id === presetGuestId) : guests;
  const isValid = guestId.length > 0 && origin.trim().length > 0 && destination.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;
    const segment = addTravelSegment({
      guestId,
      householdId: guest.householdId,
      event,
      direction,
      travelMode,
      origin: origin.trim(),
      destination: destination.trim(),
      bookingStatus: 'Not Booked',
      ticketConfirmed: false,
      pickupRequired: false,
      dropRequired: false,
    });
    handleClose();
    openTravelDetail(segment.id);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Travel Segment"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            Create Travel Segment
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field>
          <Label htmlFor="add-travel-guest" required>
            Guest
          </Label>
          <Select id="add-travel-guest" value={guestId} onChange={(e) => setGuestId(e.target.value)} disabled={Boolean(presetGuestId)}>
            <option value="">Select a guest…</option>
            {guestOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="add-travel-event">Event</Label>
            <Select id="add-travel-event" value={event} onChange={(e) => setEvent(e.target.value as EventScope)}>
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="add-travel-direction">Direction</Label>
            <Select id="add-travel-direction" value={direction} onChange={(e) => setDirection(e.target.value as TravelDirection)}>
              {TRAVEL_DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field>
          <Label htmlFor="add-travel-mode">Mode</Label>
          <Select id="add-travel-mode" value={travelMode} onChange={(e) => setTravelMode(e.target.value as TravelMode)}>
            {TRAVEL_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="add-travel-origin" required>
              Origin
            </Label>
            <Input id="add-travel-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Kochi" autoFocus />
          </Field>
          <Field>
            <Label htmlFor="add-travel-destination" required>
              Destination
            </Label>
            <Input
              id="add-travel-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. RGIA (Hyderabad Airport)"
            />
          </Field>
        </div>
        <p className="text-xs text-ink-faint">
          Locations are free text — use any airport, station, bus terminal, or custom pickup point. You can edit dates, booking details, and pickup/drop needs right after creating this segment.
        </p>
      </div>
    </Modal>
  );
}
