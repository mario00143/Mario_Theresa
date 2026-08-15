import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useGuests } from '@/hooks/useGuests';
import { useVehicles } from '@/hooks/useVehicles';
import { isTransportAssignmentActive } from '@/utils/transportLogic';
import { VehicleCapacityExceededError } from '@/data/repositories/transportAssignmentRepository';

const SHUTTLE_TYPES = ['Church Shuttle', 'Reception Shuttle'];

export function ShuttleAssignmentsPanel() {
  const { routes } = useTransportRoutes();
  const { transportAssignments, addTransportAssignment, deleteTransportAssignment } = useTransportAssignments();
  const { guests } = useGuests();
  const { vehicles } = useVehicles();
  const [pickerRouteId, setPickerRouteId] = useState<string | null>(null);
  const [pickedGuestId, setPickedGuestId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const shuttleRoutes = routes.filter((r) => SHUTTLE_TYPES.includes(r.routeType));
  const guestById = new Map(guests.map((g) => [g.id, g]));

  if (shuttleRoutes.length === 0) {
    return <EmptyState title="No shuttle routes yet" description="Add a Church Shuttle or Reception Shuttle route in the Transport tab to start assigning guests." />;
  }

  const handleAddGuest = (routeId: string) => {
    if (!pickedGuestId) return;
    setError(null);
    try {
      addTransportAssignment({
        routeId,
        guestId: pickedGuestId,
        seatCount: 1,
        assistanceRequired: false,
        assignmentStatus: 'Planned',
      });
      setPickedGuestId('');
      setPickerRouteId(null);
    } catch (err) {
      if (err instanceof VehicleCapacityExceededError) {
        setError(`This vehicle seats ${err.capacity}, but this would bring it to ${err.attemptedSeats} seat(s). Choose a different route or vehicle.`);
      } else {
        setError('Could not add this guest.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {shuttleRoutes.map((route) => {
        const vehicle = vehicles.find((v) => v.id === route.vehicleId);
        const assignments = transportAssignments.filter((a) => a.routeId === route.id && isTransportAssignmentActive(a));
        const assignedGuestIds = new Set(assignments.map((a) => a.guestId));
        const availableGuests = guests.filter((g) => !assignedGuestIds.has(g.id));

        return (
          <Card key={route.id}>
            <CardHeader>
              <CardTitle>{route.name}</CardTitle>
              {vehicle && (
                <Badge tone={assignments.length > vehicle.passengerCapacity ? 'critical' : 'neutral'}>
                  {assignments.length}/{vehicle.passengerCapacity} seats
                </Badge>
              )}
            </CardHeader>
            <CardBody className="space-y-2.5">
              {assignments.length === 0 ? (
                <p className="text-xs text-ink-faint">No guests assigned yet.</p>
              ) : (
                <ul className="space-y-1">
                  {assignments.map((assignment) => (
                    <li key={assignment.id} className="flex items-center justify-between text-xs">
                      <span className="text-ink-soft">{guestById.get(assignment.guestId)?.fullName ?? 'Unknown guest'}</span>
                      <button type="button" onClick={() => deleteTransportAssignment(assignment.id)} className="text-ink-faint hover:text-critical">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {pickerRouteId === route.id ? (
                <div className="space-y-2">
                  <Field>
                    <Select value={pickedGuestId} onChange={(e) => setPickedGuestId(e.target.value)} aria-label="Select guest to add">
                      <option value="">Select a guest…</option>
                      {availableGuests.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.fullName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <FieldError>{error}</FieldError>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleAddGuest(route.id)} disabled={!pickedGuestId}>
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPickerRouteId(null);
                        setPickedGuestId('');
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setPickerRouteId(route.id)}>
                  Add guest to shuttle
                </Button>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
