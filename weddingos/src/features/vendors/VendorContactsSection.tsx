import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { VendorContact } from '@/types';
import { PREFERRED_CONTACT_METHODS } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useVendorContacts, useVendorContactsForVendor } from '@/hooks/useVendorContacts';

function ContactRow({ contact }: { contact: VendorContact }) {
  const { updateVendorContact, deleteVendorContact } = useVendorContacts();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <Input
          defaultValue={contact.name}
          key={`contact-name-${contact.id}`}
          onBlur={(e) => updateVendorContact(contact.id, { name: e.target.value })}
          className="font-medium"
          aria-label="Contact name"
        />
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete contact "${contact.name}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`contact-role-${contact.id}`}>Role</Label>
          <Input
            id={`contact-role-${contact.id}`}
            defaultValue={contact.role ?? ''}
            key={`contact-role-${contact.id}`}
            onBlur={(e) => updateVendorContact(contact.id, { role: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`contact-method-${contact.id}`}>Preferred contact</Label>
          <Select
            id={`contact-method-${contact.id}`}
            value={contact.preferredContactMethod}
            onChange={(e) => updateVendorContact(contact.id, { preferredContactMethod: e.target.value as VendorContact['preferredContactMethod'] })}
          >
            {PREFERRED_CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`contact-phone-${contact.id}`}>Phone</Label>
          <Input
            id={`contact-phone-${contact.id}`}
            defaultValue={contact.phone ?? ''}
            key={`contact-phone-${contact.id}`}
            onBlur={(e) => updateVendorContact(contact.id, { phone: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`contact-altphone-${contact.id}`}>Alternate phone</Label>
          <Input
            id={`contact-altphone-${contact.id}`}
            defaultValue={contact.alternatePhone ?? ''}
            key={`contact-altphone-${contact.id}`}
            onBlur={(e) => updateVendorContact(contact.id, { alternatePhone: e.target.value || undefined })}
          />
        </Field>
      </div>
      <Field>
        <Label htmlFor={`contact-email-${contact.id}`}>Email</Label>
        <Input
          id={`contact-email-${contact.id}`}
          type="email"
          defaultValue={contact.email ?? ''}
          key={`contact-email-${contact.id}`}
          onBlur={(e) => updateVendorContact(contact.id, { email: e.target.value || undefined })}
        />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete contact"
        message={`Delete "${contact.name}"? If this is the vendor's primary or backup contact, that link will be cleared. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteVendorContact(contact.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function VendorContactsSection({ vendorId }: { vendorId: string }) {
  const contacts = useVendorContactsForVendor(vendorId);
  const { addVendorContact } = useVendorContacts();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addVendorContact({ vendorId, name: newName.trim(), preferredContactMethod: 'Phone' });
    setNewName('');
  };

  return (
    <section className="space-y-3 border-t border-line-soft pt-5">
      <p className="text-sm font-semibold text-ink">Contacts</p>
      {contacts.length === 0 && <p className="text-xs text-ink-faint">No contacts yet.</p>}
      <div className="space-y-2.5">
        {contacts.map((c) => (
          <ContactRow key={c.id} contact={c} />
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New contact name…" aria-label="New contact name" />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newName.trim()}>
          Add Contact
        </Button>
      </div>
    </section>
  );
}
