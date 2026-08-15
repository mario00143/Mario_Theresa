import { useState } from 'react';
import { Plus, Send, Trash2, Truck, UserPlus } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import {
  GUEST_EVENTS,
  HOUSEHOLD_SIDES,
  INVITATION_METHODS,
  INVITATION_PRIORITIES,
  INVITATION_STATUSES,
  RELATIONSHIP_CATEGORIES,
  type GuestEvent,
  type InvitationMethod,
} from '@/types';
import { useUI } from '@/context/UIContext';
import { useHousehold, useHouseholds } from '@/hooks/useHouseholds';
import { useGuestsForHousehold } from '@/hooks/useGuests';
import { useOwners } from '@/hooks/useOwners';
import { formatDisplayDate } from '@/utils/date';
import { findSimilarHouseholds } from '@/utils/duplicateDetection';
import { InvitationStatusBadge } from './GuestBadges';
import { DuplicateWarnings } from './DuplicateWarnings';
import { HouseholdRsvpEditor } from './HouseholdRsvpEditor';

export function HouseholdDetailDrawer() {
  const { selectedHouseholdId, closeHouseholdDetail, openGuestDetail, openQuickAdd } = useUI();
  const household = useHousehold(selectedHouseholdId ?? undefined);
  const { households, updateHousehold, deleteHousehold, markReady, markSent, markDelivered, markFollowUpRequired, markComplete } =
    useHouseholds();
  const members = useGuestsForHousehold(selectedHouseholdId ?? undefined);
  const { owners } = useOwners();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!selectedHouseholdId) return null;

  if (!household) {
    return (
      <Drawer open onClose={closeHouseholdDetail} title="Household not found">
        <p className="text-sm text-ink-faint">This household may have been deleted.</p>
      </Drawer>
    );
  }

  const duplicateWarnings = findSimilarHouseholds(household, households, household.id);

  const toggleInvitedEvent = (event: GuestEvent) => {
    const next = household.invitedEvents.includes(event)
      ? household.invitedEvents.filter((e) => e !== event)
      : [...household.invitedEvents, event];
    updateHousehold(household.id, { invitedEvents: next });
  };

  const toggleInvitationMethod = (method: InvitationMethod) => {
    const next = household.invitationMethod.includes(method)
      ? household.invitationMethod.filter((m) => m !== method)
      : [...household.invitationMethod, method];
    updateHousehold(household.id, { invitationMethod: next });
  };

  const handleDelete = () => {
    // deleteHousehold cascades: it also removes every guest in this household.
    deleteHousehold(household.id);
    setConfirmDelete(false);
    closeHouseholdDetail();
  };

  return (
    <>
      <Drawer
        open
        onClose={closeHouseholdDetail}
        title={household.householdName || 'Unnamed household'}
        subtitle={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{household.side}</Badge>
            <InvitationStatusBadge status={household.invitationStatus} />
            <span className="text-xs text-ink-faint">{members.length} member{members.length === 1 ? '' : 's'}</span>
          </div>
        }
        footer={
          <>
            <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" icon={<Send className="size-4" aria-hidden="true" />} onClick={() => markSent(household.id)}>
              Mark Sent
            </Button>
            <Button variant="secondary" icon={<Truck className="size-4" aria-hidden="true" />} onClick={() => markDelivered(household.id)}>
              Mark Delivered
            </Button>
            <Button variant="primary" icon={<UserPlus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('guest')}>
              Add Guest
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {duplicateWarnings.length > 0 && <DuplicateWarnings warnings={duplicateWarnings} />}

          <section className="space-y-3">
            <p className="text-sm font-semibold text-ink">Household information</p>
            <Field>
              <Label htmlFor="hh-name" required>
                Household name
              </Label>
              <Input
                id="hh-name"
                defaultValue={household.householdName}
                key={`name-${household.id}`}
                onBlur={(e) => updateHousehold(household.id, { householdName: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="hh-contact" required>
                  Primary contact
                </Label>
                <Input
                  id="hh-contact"
                  defaultValue={household.primaryContactName}
                  key={`contact-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { primaryContactName: e.target.value })}
                />
              </Field>
              <Field>
                <Label htmlFor="hh-side">Side</Label>
                <Select id="hh-side" value={household.side} onChange={(e) => updateHousehold(household.id, { side: e.target.value as typeof household.side })}>
                  {HOUSEHOLD_SIDES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="hh-phone">Primary phone</Label>
                <Input
                  id="hh-phone"
                  defaultValue={household.primaryPhone}
                  key={`phone-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { primaryPhone: e.target.value })}
                />
              </Field>
              <Field>
                <Label htmlFor="hh-phone2">Secondary phone</Label>
                <Input
                  id="hh-phone2"
                  defaultValue={household.secondaryPhone ?? ''}
                  key={`phone2-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { secondaryPhone: e.target.value || undefined })}
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="hh-email">Email</Label>
              <Input
                id="hh-email"
                type="email"
                defaultValue={household.email ?? ''}
                key={`email-${household.id}`}
                onBlur={(e) => updateHousehold(household.id, { email: e.target.value || undefined })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="hh-relationship">Relationship category</Label>
                <Select
                  id="hh-relationship"
                  value={household.relationshipCategory}
                  onChange={(e) => updateHousehold(household.id, { relationshipCategory: e.target.value as typeof household.relationshipCategory })}
                >
                  {RELATIONSHIP_CATEGORIES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="hh-relationship-detail">Relationship detail</Label>
                <Input
                  id="hh-relationship-detail"
                  defaultValue={household.relationshipDetail ?? ''}
                  key={`reldetail-${household.id}`}
                  placeholder="e.g. Groom's maternal aunt's family"
                  onBlur={(e) => updateHousehold(household.id, { relationshipDetail: e.target.value || undefined })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field>
                <Label htmlFor="hh-city" required>
                  City
                </Label>
                <Input
                  id="hh-city"
                  defaultValue={household.city}
                  key={`city-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { city: e.target.value })}
                />
              </Field>
              <Field>
                <Label htmlFor="hh-state">State</Label>
                <Input
                  id="hh-state"
                  defaultValue={household.state ?? ''}
                  key={`state-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { state: e.target.value || undefined })}
                />
              </Field>
              <Field>
                <Label htmlFor="hh-country">Country</Label>
                <Input
                  id="hh-country"
                  defaultValue={household.country}
                  key={`country-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { country: e.target.value })}
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="hh-address1">Address line 1</Label>
              <Input
                id="hh-address1"
                defaultValue={household.addressLine1 ?? ''}
                key={`addr1-${household.id}`}
                onBlur={(e) => updateHousehold(household.id, { addressLine1: e.target.value || undefined })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="hh-address2">Address line 2</Label>
                <Input
                  id="hh-address2"
                  defaultValue={household.addressLine2 ?? ''}
                  key={`addr2-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { addressLine2: e.target.value || undefined })}
                />
              </Field>
              <Field>
                <Label htmlFor="hh-postal">Postal code</Label>
                <Input
                  id="hh-postal"
                  defaultValue={household.postalCode ?? ''}
                  key={`postal-${household.id}`}
                  onBlur={(e) => updateHousehold(household.id, { postalCode: e.target.value || undefined })}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Invitation</p>

            <div>
              <Label>Invited events</Label>
              <div className="flex gap-4 mt-1">
                {GUEST_EVENTS.map((event) => (
                  <label key={event} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={household.invitedEvents.includes(event)}
                      onChange={() => toggleInvitedEvent(event)}
                      className="size-4 accent-brand-700"
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Invitation method</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                {INVITATION_METHODS.map((method) => (
                  <label key={method} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={household.invitationMethod.includes(method)}
                      onChange={() => toggleInvitationMethod(method)}
                      className="size-4 accent-brand-700"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="hh-priority">Invitation priority</Label>
                <Select
                  id="hh-priority"
                  value={household.invitationPriority}
                  onChange={(e) => updateHousehold(household.id, { invitationPriority: e.target.value as typeof household.invitationPriority })}
                >
                  {INVITATION_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="hh-status">Invitation status</Label>
                <Select
                  id="hh-status"
                  value={household.invitationStatus}
                  onChange={(e) => updateHousehold(household.id, { invitationStatus: e.target.value as typeof household.invitationStatus })}
                >
                  {INVITATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => markReady(household.id)}>
                Mark Ready
              </Button>
              <Button variant="secondary" size="sm" onClick={() => markSent(household.id)}>
                Mark Sent
              </Button>
              <Button variant="secondary" size="sm" onClick={() => markDelivered(household.id)}>
                Mark Delivered
              </Button>
              <Button variant="secondary" size="sm" onClick={() => markFollowUpRequired(household.id)}>
                Mark Follow-up Required
              </Button>
              <Button variant="secondary" size="sm" onClick={() => markComplete(household.id)}>
                Mark Complete
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-ink-faint">
              <div>Prepared {formatDisplayDate(household.preparedAt)}</div>
              <div>Sent {formatDisplayDate(household.sentAt)}</div>
              <div>Delivered {formatDisplayDate(household.deliveredAt)}</div>
              <div>Owner: {household.invitationOwner ?? '—'}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="hh-owner">Invitation owner</Label>
                <Select id="hh-owner" value={household.invitationOwner ?? ''} onChange={(e) => updateHousehold(household.id, { invitationOwner: e.target.value || undefined })}>
                  <option value="">Unassigned</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="hh-followup-owner">RSVP follow-up owner</Label>
                <Select id="hh-followup-owner" value={household.rsvpFollowUpOwner ?? ''} onChange={(e) => updateHousehold(household.id, { rsvpFollowUpOwner: e.target.value || undefined })}>
                  <option value="">Unassigned</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field>
              <Label htmlFor="hh-courier">Courier tracking number</Label>
              <Input
                id="hh-courier"
                defaultValue={household.courierTrackingNumber ?? ''}
                key={`courier-${household.id}`}
                onBlur={(e) => updateHousehold(household.id, { courierTrackingNumber: e.target.value || undefined })}
              />
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Household members</p>
              <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('guest')}>
                Add guest
              </Button>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-ink-faint">No guests added yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {members.map((guest) => (
                  <li key={guest.id}>
                    <button
                      type="button"
                      onClick={() => openGuestDetail(guest.id)}
                      className="w-full flex items-center justify-between gap-2 rounded-lg border border-line-soft px-3 py-2 text-left hover:bg-surface-subtle"
                    >
                      <span className="text-sm text-ink truncate">{guest.fullName}</span>
                      <span className="text-xs text-ink-faint shrink-0">{guest.ageCategory} · {guest.relationship ?? '—'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">RSVP summary</p>
            <HouseholdRsvpEditor household={household} />
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <Field>
              <Label htmlFor="hh-notes">Notes</Label>
              <Textarea
                id="hh-notes"
                defaultValue={household.notes ?? ''}
                key={`notes-${household.id}`}
                onBlur={(e) => updateHousehold(household.id, { notes: e.target.value || undefined })}
              />
              <FieldHint>Internal notes — not shown to guests.</FieldHint>
            </Field>
          </section>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line-soft text-xs text-ink-faint">
            <div>Created {formatDisplayDate(household.createdAt)}</div>
            <div>Updated {formatDisplayDate(household.updatedAt)}</div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete household"
        message={
          members.length > 0
            ? `"${household.householdName}" has ${members.length} guest${members.length === 1 ? '' : 's'} attached. Deleting this household will also delete ${members.length === 1 ? 'that guest' : 'all of those guests'}. This cannot be undone.`
            : `Are you sure you want to delete "${household.householdName}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
