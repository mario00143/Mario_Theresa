import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EventScope, RouteStatus, RouteType, TransportRoute } from '@/types';
import { EVENTS, ROUTE_STATUSES, ROUTE_TYPES } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { RouteStatusBadge } from './LogisticsBadges';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { seatsAssignedForRoute } from '@/utils/transportLogic';

function RouteRow({ route }: { route: TransportRoute }) {
  const { updateTransportRoute, deleteTransportRoute } = useTransportRoutes();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { transportAssignments } = useTransportAssignments();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const vehicle = vehicles.find((v) => v.id === route.vehicleId);
  const seatsAssigned = seatsAssignedForRoute(transportAssignments, route.id);
  const missingVehicle = !route.vehicleId;
  const missingDriver = !route.driverId;

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <Input defaultValue={route.name} key={`r-name-${route.id}`} onBlur={(e) => updateTransportRoute(route.id, { name: e.target.value })} className="font-medium" aria-label="Route name" />
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete route "${route.name}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <RouteStatusBadge status={route.status} />
        {missingVehicle && <Badge tone="critical">No vehicle</Badge>}
        {missingDriver && <Badge tone="warning">No driver</Badge>}
        {vehicle && <Badge tone={seatsAssigned > vehicle.passengerCapacity ? 'critical' : 'neutral'}>{seatsAssigned}/{vehicle.passengerCapacity} seats</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-event-${route.id}`}>Event</Label>
          <Select id={`r-event-${route.id}`} value={route.event} onChange={(e) => updateTransportRoute(route.id, { event: e.target.value as EventScope })}>
            {EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`r-type-${route.id}`}>Route type</Label>
          <Select id={`r-type-${route.id}`} value={route.routeType} onChange={(e) => updateTransportRoute(route.id, { routeType: e.target.value as RouteType })}>
            {ROUTE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-origin-${route.id}`}>Origin</Label>
          <Input id={`r-origin-${route.id}`} defaultValue={route.origin} key={`r-origin-${route.id}`} onBlur={(e) => updateTransportRoute(route.id, { origin: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`r-dest-${route.id}`}>Destination</Label>
          <Input id={`r-dest-${route.id}`} defaultValue={route.destination} key={`r-dest-${route.id}`} onBlur={(e) => updateTransportRoute(route.id, { destination: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-date-${route.id}`}>Planned date</Label>
          <Input
            id={`r-date-${route.id}`}
            type="date"
            value={route.plannedDepartureDate ?? ''}
            onChange={(e) => updateTransportRoute(route.id, { plannedDepartureDate: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`r-time-${route.id}`}>Planned time</Label>
          <Input
            id={`r-time-${route.id}`}
            type="time"
            value={route.plannedDepartureTime ?? ''}
            onChange={(e) => updateTransportRoute(route.id, { plannedDepartureTime: e.target.value || undefined })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-vehicle-${route.id}`}>Vehicle</Label>
          <Select id={`r-vehicle-${route.id}`} value={route.vehicleId ?? ''} onChange={(e) => updateTransportRoute(route.id, { vehicleId: e.target.value || undefined })}>
            <option value="">Unassigned</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`r-driver-${route.id}`}>Driver</Label>
          <Select id={`r-driver-${route.id}`} value={route.driverId ?? ''} onChange={(e) => updateTransportRoute(route.id, { driverId: e.target.value || undefined })}>
            <option value="">Unassigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field>
        <Label htmlFor={`r-status-${route.id}`}>Status</Label>
        <Select id={`r-status-${route.id}`} value={route.status} onChange={(e) => updateTransportRoute(route.id, { status: e.target.value as RouteStatus })}>
          {ROUTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete route"
        message={`Delete "${route.name}"? Any transport assignments on this route will also be removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteTransportRoute(route.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function RoutesPanel() {
  const { routes, addTransportRoute } = useTransportRoutes();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTransportRoute({
      name: newName.trim(),
      event: 'Wedding',
      routeType: 'Airport Pickup',
      origin: '',
      destination: '',
      status: 'Planned',
    });
    setNewName('');
  };

  return (
    <div className="space-y-3">
      {routes.length === 0 ? (
        <EmptyState title="No routes yet" description="Add a route to start assigning guests for pickup, drop, or shuttle transport." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {routes.map((route) => (
            <RouteRow key={route.id} route={route} />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New route name…" aria-label="New route name" />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newName.trim()}>
          Add Route
        </Button>
      </div>
    </div>
  );
}
