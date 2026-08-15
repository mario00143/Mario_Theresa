import { useState } from 'react';
import type { Guest, TransportRoute, TravelSegment } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, Label, Select } from '@/components/ui/Field';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { VehicleCapacityExceededError } from '@/data/repositories/transportAssignmentRepository';

interface AssignTransportModalProps {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
  segment?: TravelSegment;
  routes: TransportRoute[];
}

export function AssignTransportModal({ open, onClose, guest, segment, routes }: AssignTransportModalProps) {
  const { addTransportAssignment } = useTransportAssignments();
  const [routeId, setRouteId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!guest) return null;

  const reset = () => {
    setRouteId('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!routeId) return;
    setError(null);
    try {
      addTransportAssignment({
        routeId,
        guestId: guest.id,
        travelSegmentId: segment?.id,
        seatCount: 1,
        assistanceRequired: false,
        assignmentStatus: 'Planned',
      });
      handleClose();
    } catch (err) {
      if (err instanceof VehicleCapacityExceededError) {
        setError(`This route's vehicle seats ${err.capacity}, but this assignment would bring it to ${err.attemptedSeats} seat(s). Choose a different route or vehicle.`);
      } else {
        setError('Could not save this assignment.');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Assign transport for ${guest.fullName}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!routeId}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field>
          <Label htmlFor="assign-transport-route" required>
            Route
          </Label>
          <Select id="assign-transport-route" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
            <option value="">Select a route…</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.origin} → {r.destination})
              </option>
            ))}
          </Select>
        </Field>
        <FieldError>{error}</FieldError>
      </div>
    </Modal>
  );
}
