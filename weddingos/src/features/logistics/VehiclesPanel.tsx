import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { VEHICLE_STATUSES, VEHICLE_TYPES } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVehicles } from '@/hooks/useVehicles';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useVendors } from '@/hooks/useVendors';
import { useUI } from '@/context/UIContext';
import { seatsAssignedForRoute } from '@/utils/transportLogic';

function VehicleRow({ vehicle, seatsAssigned }: { vehicle: Vehicle; seatsAssigned: number }) {
  const { updateVehicle, deleteVehicle } = useVehicles();
  const { vendors } = useVendors();
  const { openVendorDetail } = useUI();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overCapacity = seatsAssigned > vehicle.passengerCapacity;

  return (
    <div className={`rounded-lg border p-3 space-y-2.5 ${overCapacity ? 'border-critical/50 bg-critical-bg' : 'border-line-soft'}`}>
      <div className="flex items-start justify-between gap-2">
        <Input defaultValue={vehicle.name} key={`v-name-${vehicle.id}`} onBlur={(e) => updateVehicle(vehicle.id, { name: e.target.value })} className="font-medium" aria-label="Vehicle name" />
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete vehicle "${vehicle.name}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`v-type-${vehicle.id}`}>Type</Label>
          <Select id={`v-type-${vehicle.id}`} value={vehicle.vehicleType} onChange={(e) => updateVehicle(vehicle.id, { vehicleType: e.target.value as VehicleType })}>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`v-status-${vehicle.id}`}>Status</Label>
          <Select id={`v-status-${vehicle.id}`} value={vehicle.status} onChange={(e) => updateVehicle(vehicle.id, { status: e.target.value as VehicleStatus })}>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`v-reg-${vehicle.id}`}>Registration number</Label>
          <Input
            id={`v-reg-${vehicle.id}`}
            defaultValue={vehicle.registrationNumber ?? ''}
            key={`v-reg-${vehicle.id}`}
            onBlur={(e) => updateVehicle(vehicle.id, { registrationNumber: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`v-cap-${vehicle.id}`}>Passenger capacity</Label>
          <Input
            id={`v-cap-${vehicle.id}`}
            type="number"
            min={1}
            defaultValue={vehicle.passengerCapacity}
            key={`v-cap-${vehicle.id}-${vehicle.passengerCapacity}`}
            onBlur={(e) => updateVehicle(vehicle.id, { passengerCapacity: Number(e.target.value) || 1 })}
          />
        </Field>
      </div>
      <Field>
        <Label htmlFor={`v-vendor-${vehicle.id}`}>Vendor</Label>
        <Input id={`v-vendor-${vehicle.id}`} defaultValue={vehicle.vendorName ?? ''} key={`v-vendor-${vehicle.id}`} onBlur={(e) => updateVehicle(vehicle.id, { vendorName: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`v-linked-vendor-${vehicle.id}`}>Linked commercial vendor</Label>
        <Select
          id={`v-linked-vendor-${vehicle.id}`}
          value={vehicle.vendorId ?? ''}
          onChange={(e) => updateVehicle(vehicle.id, { vendorId: e.target.value || undefined })}
        >
          <option value="">None</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
        {vehicle.vendorId && (
          <button type="button" onClick={() => openVendorDetail(vehicle.vendorId!)} className="mt-1.5 text-xs font-medium text-brand-700 hover:underline">
            View linked vendor record
          </button>
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input type="checkbox" checked={vehicle.airConditioned} onChange={(e) => updateVehicle(vehicle.id, { airConditioned: e.target.checked })} className="size-3.5 accent-brand-700" />
          AC
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input type="checkbox" checked={vehicle.backupVehicle} onChange={(e) => updateVehicle(vehicle.id, { backupVehicle: e.target.checked })} className="size-3.5 accent-brand-700" />
          Backup vehicle
        </label>
        <Badge tone={overCapacity ? 'critical' : 'neutral'}>
          {seatsAssigned}/{vehicle.passengerCapacity} seats assigned
        </Badge>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete vehicle"
        message={`Delete "${vehicle.name}"? Any driver assigned to it will be unlinked. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteVehicle(vehicle.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function VehiclesPanel() {
  const { vehicles, addVehicle } = useVehicles();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();
  const [newName, setNewName] = useState('');

  const seatsByVehicleId = new Map<string, number>();
  for (const vehicle of vehicles) {
    const vehicleRoutes = routes.filter((r) => r.vehicleId === vehicle.id);
    const total = vehicleRoutes.reduce((sum, route) => sum + seatsAssignedForRoute(transportAssignments, route.id), 0);
    seatsByVehicleId.set(vehicle.id, total);
  }

  const handleAdd = () => {
    if (!newName.trim()) return;
    addVehicle({ name: newName.trim(), vehicleType: 'Sedan', passengerCapacity: 4, airConditioned: true, status: 'Available', backupVehicle: false });
    setNewName('');
  };

  return (
    <div className="space-y-3">
      {vehicles.length === 0 ? (
        <EmptyState title="No vehicles yet" description="Add a vehicle to start planning pickups, drops, and shuttles." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <VehicleRow key={vehicle.id} vehicle={vehicle} seatsAssigned={seatsByVehicleId.get(vehicle.id) ?? 0} />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New vehicle name…" aria-label="New vehicle name" />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newName.trim()}>
          Add Vehicle
        </Button>
      </div>
    </div>
  );
}
