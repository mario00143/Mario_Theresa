import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Driver } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';

function DriverRow({ driver }: { driver: Driver }) {
  const { updateDriver, deleteDriver } = useDrivers();
  const { vehicles } = useVehicles();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <Input defaultValue={driver.name} key={`d-name-${driver.id}`} onBlur={(e) => updateDriver(driver.id, { name: e.target.value })} className="font-medium" aria-label="Driver name" />
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete driver "${driver.name}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`d-phone-${driver.id}`}>Phone</Label>
          <Input id={`d-phone-${driver.id}`} defaultValue={driver.phone} key={`d-phone-${driver.id}`} onBlur={(e) => updateDriver(driver.id, { phone: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`d-vehicle-${driver.id}`}>Assigned vehicle</Label>
          <Select id={`d-vehicle-${driver.id}`} value={driver.vehicleId ?? ''} onChange={(e) => updateDriver(driver.id, { vehicleId: e.target.value || undefined })}>
            <option value="">Unassigned</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field>
        <Label htmlFor={`d-notes-${driver.id}`}>Notes</Label>
        <Input id={`d-notes-${driver.id}`} defaultValue={driver.notes ?? ''} key={`d-notes-${driver.id}`} onBlur={(e) => updateDriver(driver.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete driver"
        message={`Delete "${driver.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteDriver(driver.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function DriversPanel() {
  const { drivers, addDriver } = useDrivers();
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    addDriver({ name: newName.trim(), phone: newPhone.trim() });
    setNewName('');
    setNewPhone('');
  };

  return (
    <div className="space-y-3">
      {drivers.length === 0 ? (
        <EmptyState title="No drivers yet" description="Add a driver to start assigning them to vehicles and routes." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {drivers.map((driver) => (
            <DriverRow key={driver.id} driver={driver} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New driver name…" aria-label="New driver name" />
        <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone…" className="w-48" aria-label="New driver phone" />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newName.trim() || !newPhone.trim()}>
          Add Driver
        </Button>
      </div>
    </div>
  );
}
