import { useState } from 'react';
import type { ArrivalCluster } from '@/utils/arrivalClustering';
import type { EventScope, RouteType } from '@/types';
import { EVENTS, ROUTE_TYPES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select } from '@/components/ui/Field';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useGuests } from '@/hooks/useGuests';
import { VehicleCapacityExceededError } from '@/data/repositories/transportAssignmentRepository';

interface CreateRouteFromClusterModalProps {
  open: boolean;
  onClose: () => void;
  cluster: ArrivalCluster | null;
  direction: 'Arrival' | 'Departure';
}

export function CreateRouteFromClusterModal({ open, onClose, cluster, direction }: CreateRouteFromClusterModalProps) {
  const { addTransportRoute } = useTransportRoutes();
  const { addTransportAssignment } = useTransportAssignments();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { guests } = useGuests();

  const [name, setName] = useState('');
  const [routeType, setRouteType] = useState<RouteType>(direction === 'Arrival' ? 'Airport Pickup' : 'Airport Drop');
  const [event, setEvent] = useState<EventScope>('Wedding');
  const [otherLocation, setOtherLocation] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ created: number; failed: string[] } | null>(null);

  if (!cluster) return null;

  const guestById = new Map(guests.map((g) => [g.id, g]));
  const clusterGuests = cluster.segments.map((s) => ({ segment: s, guest: guestById.get(s.guestId) }));

  const effectiveName = name || `Shared ${direction === 'Arrival' ? 'Pickup' : 'Drop'} — ${cluster.location} (${cluster.date})`;
  const effectiveSelected = selectedGuestIds.size > 0 ? selectedGuestIds : new Set(clusterGuests.map((g) => g.segment.guestId));

  const reset = () => {
    setName('');
    setOtherLocation('');
    setVehicleId('');
    setDriverId('');
    setSelectedGuestIds(new Set());
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleGuest = (guestId: string) => {
    setSelectedGuestIds((prev) => {
      const base = prev.size > 0 ? prev : new Set(clusterGuests.map((g) => g.segment.guestId));
      const next = new Set(base);
      if (next.has(guestId)) next.delete(guestId);
      else next.add(guestId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!otherLocation.trim()) return;
    const route = addTransportRoute({
      name: effectiveName,
      event,
      routeType,
      origin: direction === 'Arrival' ? cluster.location : cluster.location,
      destination: direction === 'Arrival' ? otherLocation.trim() : otherLocation.trim(),
      plannedDepartureDate: cluster.date,
      plannedDepartureTime: cluster.earliestTime,
      vehicleId: vehicleId || undefined,
      driverId: driverId || undefined,
      status: 'Planned',
    });

    let created = 0;
    const failed: string[] = [];
    for (const { segment, guest } of clusterGuests) {
      if (!effectiveSelected.has(segment.guestId)) continue;
      try {
        addTransportAssignment({
          routeId: route.id,
          guestId: segment.guestId,
          travelSegmentId: segment.id,
          seatCount: 1,
          assistanceRequired: false,
          assignmentStatus: 'Planned',
        });
        created += 1;
      } catch (err) {
        if (err instanceof VehicleCapacityExceededError) {
          failed.push(guest?.fullName ?? 'Unknown guest');
        }
      }
    }

    if (failed.length > 0) {
      setResult({ created, failed });
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Create Route from ${direction === 'Arrival' ? 'Arrival' : 'Departure'} Cluster`}
      footer={
        result ? (
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!otherLocation.trim()}>
              Create Route &amp; Assign
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-2">
          <p className="text-sm text-ink">Route created — {result.created} guest(s) assigned.</p>
          {result.failed.length > 0 && (
            <p className="text-xs text-critical">
              Could not assign: {result.failed.join(', ')} — the selected vehicle's capacity was reached. Assign them to a different route from the Transport tab.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ink-faint">{cluster.segments.length} guest(s) clustered at {cluster.location} between {cluster.earliestTime} and {cluster.latestTime} on {cluster.date}.</p>
          <Field>
            <Label htmlFor="cluster-route-name">Route name</Label>
            <Input id="cluster-route-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={effectiveName} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="cluster-route-event">Event</Label>
              <Select id="cluster-route-event" value={event} onChange={(e) => setEvent(e.target.value as EventScope)}>
                {EVENTS.map((ev) => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="cluster-route-type">Route type</Label>
              <Select id="cluster-route-type" value={routeType} onChange={(e) => setRouteType(e.target.value as RouteType)}>
                {ROUTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field>
            <Label htmlFor="cluster-route-other" required>
              {direction === 'Arrival' ? 'Destination (e.g. hotel)' : 'Destination (e.g. airport/station)'}
            </Label>
            <Input id="cluster-route-other" value={otherLocation} onChange={(e) => setOtherLocation(e.target.value)} placeholder="e.g. Marigold Grand Hyderabad" autoFocus />
            <FieldHint>{direction === 'Arrival' ? `Origin is fixed to ${cluster.location}.` : `Pickup point is fixed to ${cluster.location}.`}</FieldHint>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="cluster-route-vehicle">Vehicle</Label>
              <Select id="cluster-route-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                <option value="">Assign later</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.passengerCapacity} seats)
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="cluster-route-driver">Driver</Label>
              <Select id="cluster-route-driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                <option value="">Assign later</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field>
            <Label>Guests to assign to this route</Label>
            <div className="space-y-1.5 rounded-lg border border-line-soft p-2.5">
              {clusterGuests.map(({ segment, guest }) => (
                <label key={segment.id} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={effectiveSelected.has(segment.guestId)}
                    onChange={() => toggleGuest(segment.guestId)}
                    className="size-4 accent-brand-700"
                  />
                  {guest?.fullName ?? 'Unknown guest'}
                </label>
              ))}
            </div>
          </Field>
        </div>
      )}
    </Modal>
  );
}
