import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { EVENTS, VENDOR_CATEGORIES, type EventScope, type VendorCategory } from '@/types';
import { useVendors } from '@/hooks/useVendors';

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (vendorId: string) => void;
}

export function AddVendorModal({ open, onClose, onCreated }: AddVendorModalProps) {
  const { addVendor } = useVendors();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>(VENDOR_CATEGORIES[0]);
  const [event, setEvent] = useState<EventScope>('Wedding');
  const [city, setCity] = useState('');

  const reset = () => {
    setName('');
    setCategory(VENDOR_CATEGORIES[0]);
    setEvent('Wedding');
    setCity('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const vendor = addVendor({
      name: name.trim(),
      category,
      status: 'Researching',
      event,
      city: city.trim() || undefined,
      gstApplicable: false,
    });
    handleClose();
    onCreated(vendor.id);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Vendor"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            Create Vendor
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field>
          <Label htmlFor="add-vendor-name" required>
            Vendor name
          </Label>
          <Input id="add-vendor-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fernwood Décor Studio" autoFocus />
        </Field>
        <Field>
          <Label htmlFor="add-vendor-category" required>
            Category
          </Label>
          <Select id="add-vendor-category" value={category} onChange={(e) => setCategory(e.target.value as VendorCategory)}>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="add-vendor-event" required>
            Event
          </Label>
          <Select id="add-vendor-event" value={event} onChange={(e) => setEvent(e.target.value as EventScope)}>
            {EVENTS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="add-vendor-city">City</Label>
          <Input id="add-vendor-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Hyderabad" />
        </Field>
        <p className="text-xs text-ink-faint">Starts as "Researching". You can add contacts, quotes, and a contract right after creating this vendor.</p>
      </div>
    </Modal>
  );
}
