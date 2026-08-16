import { useState } from 'react';
import { Phone, Plus, Printer, Siren, Trash2 } from 'lucide-react';
import type { EmergencyContactCategory, EmergencyContactPriority } from '@/types';
import { EMERGENCY_CONTACT_CATEGORIES, EMERGENCY_CONTACT_PRIORITIES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useEmergencyResponseCards } from '@/hooks/useEmergencyResponseCards';
import { useVendors } from '@/hooks/useVendors';
import { primaryEmergencyContacts, sortEmergencyContacts } from '@/utils/emergencyLogic';

function ContactCard({ contactId }: { contactId: string }) {
  const { emergencyContacts, updateEmergencyContact, deleteEmergencyContact } = useEmergencyContacts();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const contact = emergencyContacts.find((c) => c.id === contactId);
  if (!contact) return null;

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{contact.name}</span>
          <Badge tone="neutral">{contact.category}</Badge>
          <Badge tone={contact.priority === 'Primary' ? 'critical' : contact.priority === 'Secondary' ? 'warning' : 'neutral'}>{contact.priority}</Badge>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete contact "${contact.name}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`ec-category-${contact.id}`}>Category</Label>
          <Select id={`ec-category-${contact.id}`} value={contact.category} onChange={(e) => updateEmergencyContact(contact.id, { category: e.target.value as EmergencyContactCategory })}>
            {EMERGENCY_CONTACT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ec-priority-${contact.id}`}>Priority</Label>
          <Select id={`ec-priority-${contact.id}`} value={contact.priority} onChange={(e) => updateEmergencyContact(contact.id, { priority: e.target.value as EmergencyContactPriority })}>
            {EMERGENCY_CONTACT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ec-phone-${contact.id}`}>Phone</Label>
          <Input id={`ec-phone-${contact.id}`} defaultValue={contact.phone} key={`ec-phone-${contact.id}`} onBlur={(e) => updateEmergencyContact(contact.id, { phone: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`ec-location-${contact.id}`}>Location</Label>
          <Input id={`ec-location-${contact.id}`} defaultValue={contact.location ?? ''} key={`ec-location-${contact.id}`} onBlur={(e) => updateEmergencyContact(contact.id, { location: e.target.value || undefined })} />
        </Field>
      </div>
      <Button variant="secondary" size="sm" icon={<Phone className="size-3.5" aria-hidden="true" />} onClick={() => (window.location.href = `tel:${contact.phone}`)}>
        Call {contact.name}
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete emergency contact"
        message={`Delete "${contact.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteEmergencyContact(contact.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function EmergencyView() {
  const { emergencyContacts, addEmergencyContact } = useEmergencyContacts();
  const { emergencyResponseCards } = useEmergencyResponseCards();
  const { vendors } = useVendors();
  const [newContactName, setNewContactName] = useState('');

  const primary = primaryEmergencyContacts(emergencyContacts);
  const sorted = sortEmergencyContacts(emergencyContacts);
  const vendorById = new Map(vendors.map((v) => [v.id, v]));

  function handleAdd() {
    if (!newContactName.trim()) return;
    addEmergencyContact({ category: 'Other', name: newContactName.trim(), phone: '', priority: 'Reference' });
    setNewContactName('');
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end">
        <Button variant="secondary" size="sm" icon={<Printer className="size-3.5" aria-hidden="true" />} onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <Card className="border-critical/40 bg-critical-bg">
        <CardBody className="flex items-start gap-2">
          <Siren className="size-5 shrink-0 text-critical" aria-hidden="true" />
          <p className="text-sm text-ink">These are operational contacts and checklists for coordinating a response — not medical or legal advice.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primary emergency contacts</CardTitle>
        </CardHeader>
        <CardBody>
          {primary.length === 0 ? (
            <EmptyState title="No primary contacts set" description="Mark a contact's priority as Primary below to feature it here." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {primary.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => (window.location.href = `tel:${c.phone}`)}
                  className="flex flex-col items-start gap-1 rounded-xl border-2 border-critical/30 bg-surface p-4 text-left hover:bg-critical-bg/40 min-h-24"
                >
                  <span className="text-xs font-medium text-ink-faint">{c.category}</span>
                  <span className="text-base font-semibold text-ink">{c.name}</span>
                  <span className="flex items-center gap-1.5 text-lg font-bold text-critical">
                    <Phone className="size-4.5" aria-hidden="true" />
                    {c.phone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency response cards</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {emergencyResponseCards.length === 0 ? (
            <EmptyState title="No response cards configured" description="Response cards are seeded per emergency scenario type." />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {emergencyResponseCards.map((card) => {
                const relatedVendor = card.relatedVendorId ? vendorById.get(card.relatedVendorId) : undefined;
                return (
                  <div key={card.id} className="rounded-lg border border-line-soft p-3 space-y-2">
                    <p className="text-sm font-semibold text-ink">{card.title}</p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      {card.immediateActions.map((action, i) => (
                        <li key={i} className="text-sm text-ink-soft">
                          {action}
                        </li>
                      ))}
                    </ol>
                    <div className="text-xs text-ink-faint space-y-0.5">
                      {card.owner && <p>Owner: {card.owner}</p>}
                      {card.backupOwner && <p>Backup owner: {card.backupOwner}</p>}
                      {relatedVendor && <p>Related vendor: {relatedVendor.name}</p>}
                      {card.contingency && <p>Contingency: {card.contingency}</p>}
                    </div>
                    {(card.contactPhone || relatedVendor?.phone) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Phone className="size-3.5" aria-hidden="true" />}
                        onClick={() => (window.location.href = `tel:${card.contactPhone ?? relatedVendor?.phone}`)}
                      >
                        Call
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All emergency contacts ({sorted.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {sorted.length === 0 ? (
            <EmptyState title="No emergency contacts yet" description="Add one below." />
          ) : (
            <div className="space-y-3">
              {sorted.map((c) => (
                <ContactCard key={c.id} contactId={c.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="New contact name…" aria-label="New emergency contact name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newContactName.trim()}>
              Add contact
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
