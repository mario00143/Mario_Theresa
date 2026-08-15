import { useState } from 'react';
import { Ban, Check, Clock, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import {
  AGE_CATEGORIES,
  DIETARY_PREFERENCES,
  GUEST_EVENTS,
  GUEST_RELATIONSHIPS,
  PLUS_ONE_STATUSES,
  RESPONSE_METHODS,
  RSVP_STATUSES,
  type GuestEvent,
  type RsvpStatus,
} from '@/types';
import { useUI } from '@/context/UIContext';
import { useGuest, useGuests } from '@/hooks/useGuests';
import { useHouseholds } from '@/hooks/useHouseholds';
import { formatDisplayDate } from '@/utils/date';
import { findSimilarGuests } from '@/utils/duplicateDetection';
import { getGuestRsvpForEvent } from '@/utils/rsvpLogic';
import { DuplicateWarnings } from './DuplicateWarnings';
import { GuestLogisticsSection } from '@/features/logistics/GuestLogisticsSection';

export function GuestDetailDrawer() {
  const { selectedGuestId, closeGuestDetail, openHouseholdDetail } = useUI();
  const guest = useGuest(selectedGuestId ?? undefined);
  const { guests, updateGuest, deleteGuest, moveGuestToHousehold, setGuestRsvpStatus, updateGuestRsvp } = useGuests();
  const { households } = useHouseholds();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [movingHouseholdId, setMovingHouseholdId] = useState('');

  if (!selectedGuestId) return null;

  if (!guest) {
    return (
      <Drawer open onClose={closeGuestDetail} title="Guest not found">
        <p className="text-sm text-ink-faint">This guest may have been deleted.</p>
      </Drawer>
    );
  }

  const household = households.find((h) => h.id === guest.householdId);
  const duplicateWarnings = findSimilarGuests(guest, guests, guest.id);

  const toggleInvitedEvent = (event: GuestEvent) => {
    const next = guest.invitedEvents.includes(event) ? guest.invitedEvents.filter((e) => e !== event) : [...guest.invitedEvents, event];
    updateGuest(guest.id, { invitedEvents: next });
  };

  const markAllEvents = (status: RsvpStatus) => {
    for (const event of guest.invitedEvents) setGuestRsvpStatus(guest.id, event, status);
  };

  const handleDelete = () => {
    deleteGuest(guest.id);
    setConfirmDelete(false);
    closeGuestDetail();
  };

  const handleMoveHousehold = () => {
    if (!movingHouseholdId) return;
    moveGuestToHousehold(guest.id, movingHouseholdId);
    setMovingHouseholdId('');
  };

  return (
    <>
      <Drawer
        open
        onClose={closeGuestDetail}
        title={guest.fullName || 'Unnamed guest'}
        subtitle={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{guest.ageCategory}</Badge>
            {household && (
              <button type="button" onClick={() => openHouseholdDetail(household.id)} className="text-xs text-brand-700 hover:underline">
                {household.householdName}
              </button>
            )}
          </div>
        }
        footer={
          <>
            <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" icon={<Clock className="size-4" aria-hidden="true" />} onClick={() => markAllEvents('Pending')}>
              Mark Pending
            </Button>
            <Button variant="secondary" icon={<Ban className="size-4" aria-hidden="true" />} onClick={() => markAllEvents('Declined')}>
              Mark Declined
            </Button>
            <Button variant="primary" icon={<Check className="size-4" aria-hidden="true" />} onClick={() => markAllEvents('Attending')}>
              Mark Attending
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {duplicateWarnings.length > 0 && <DuplicateWarnings warnings={duplicateWarnings} />}

          <section className="space-y-3">
            <p className="text-sm font-semibold text-ink">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="g-name" required>
                  Full name
                </Label>
                <Input id="g-name" defaultValue={guest.fullName} key={`name-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { fullName: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="g-preferred">Preferred name</Label>
                <Input
                  id="g-preferred"
                  defaultValue={guest.preferredName ?? ''}
                  key={`preferred-${guest.id}`}
                  onBlur={(e) => updateGuest(guest.id, { preferredName: e.target.value || undefined })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="g-title">Title</Label>
                <Input id="g-title" defaultValue={guest.title ?? ''} key={`title-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { title: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="g-age">Age category</Label>
                <Select id="g-age" value={guest.ageCategory} onChange={(e) => updateGuest(guest.id, { ageCategory: e.target.value as typeof guest.ageCategory })}>
                  {AGE_CATEGORIES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field>
              <Label htmlFor="g-relationship">Relationship</Label>
              <Select id="g-relationship" value={guest.relationship ?? ''} onChange={(e) => updateGuest(guest.id, { relationship: e.target.value || undefined })}>
                <option value="">Unspecified</option>
                {GUEST_RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="g-phone">Phone</Label>
                <Input id="g-phone" defaultValue={guest.phone ?? ''} key={`phone-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { phone: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="g-email">Email</Label>
                <Input id="g-email" type="email" defaultValue={guest.email ?? ''} key={`email-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { email: e.target.value || undefined })} />
              </Field>
            </div>

            <Field>
              <Label htmlFor="g-move-household">Move to household</Label>
              <div className="flex gap-2">
                <Select id="g-move-household" value={movingHouseholdId} onChange={(e) => setMovingHouseholdId(e.target.value)}>
                  <option value="">Select a different household…</option>
                  {households
                    .filter((h) => h.id !== guest.householdId)
                    .map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.householdName}
                      </option>
                    ))}
                </Select>
                <Button variant="secondary" onClick={handleMoveHousehold} disabled={!movingHouseholdId}>
                  Move
                </Button>
              </div>
              <FieldHint>Currently in {household?.householdName ?? 'no household'}.</FieldHint>
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Invitations &amp; RSVP</p>
            <div className="flex gap-4">
              {GUEST_EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={guest.invitedEvents.includes(event)} onChange={() => toggleInvitedEvent(event)} className="size-4 accent-brand-700" />
                  {event} invited
                </label>
              ))}
            </div>

            {guest.invitedEvents.map((event) => {
              const response = getGuestRsvpForEvent(guest, event);
              return (
                <div key={event} className="rounded-lg border border-line-soft p-3 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{event}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <Label htmlFor={`g-rsvp-status-${event}`}>Status</Label>
                      <Select
                        id={`g-rsvp-status-${event}`}
                        value={response?.status ?? 'No Response'}
                        onChange={(e) => setGuestRsvpStatus(guest.id, event, e.target.value as RsvpStatus)}
                      >
                        {RSVP_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field>
                      <Label htmlFor={`g-rsvp-method-${event}`}>Response method</Label>
                      <Select
                        id={`g-rsvp-method-${event}`}
                        value={response?.responseMethod ?? ''}
                        onChange={(e) => updateGuestRsvp(guest.id, event, { responseMethod: (e.target.value || undefined) as (typeof RESPONSE_METHODS)[number] | undefined })}
                      >
                        <option value="">Unspecified</option>
                        {RESPONSE_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <Label htmlFor={`g-rsvp-date-${event}`}>Response date</Label>
                    <Input
                      id={`g-rsvp-date-${event}`}
                      type="date"
                      value={response?.respondedAt ?? ''}
                      onChange={(e) => updateGuestRsvp(guest.id, event, { respondedAt: e.target.value || undefined })}
                    />
                  </Field>
                  <Field>
                    <Label htmlFor={`g-rsvp-notes-${event}`}>Notes</Label>
                    <Textarea
                      id={`g-rsvp-notes-${event}`}
                      defaultValue={response?.notes ?? ''}
                      key={`rsvp-notes-${event}-${guest.id}`}
                      onBlur={(e) => updateGuestRsvp(guest.id, event, { notes: e.target.value || undefined })}
                    />
                  </Field>
                </div>
              );
            })}
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Food</p>
            <Field>
              <Label htmlFor="g-diet">Dietary preference</Label>
              <Select id="g-diet" value={guest.dietaryPreference} onChange={(e) => updateGuest(guest.id, { dietaryPreference: e.target.value as typeof guest.dietaryPreference })}>
                {DIETARY_PREFERENCES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="g-diet-notes">Dietary notes</Label>
              <Textarea id="g-diet-notes" defaultValue={guest.dietaryNotes ?? ''} key={`dietnotes-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { dietaryNotes: e.target.value || undefined })} />
            </Field>
            <Field>
              <Label htmlFor="g-allergies">Allergies</Label>
              <Input id="g-allergies" defaultValue={guest.allergies ?? ''} key={`allergies-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { allergies: e.target.value || undefined })} />
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Hospitality</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={guest.accommodationRequired} onChange={(e) => updateGuest(guest.id, { accommodationRequired: e.target.checked })} className="size-4 accent-brand-700" />
                Accommodation required
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={guest.pickupRequired} onChange={(e) => updateGuest(guest.id, { pickupRequired: e.target.checked })} className="size-4 accent-brand-700" />
                Pickup required
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={guest.travelDetailsRequired} onChange={(e) => updateGuest(guest.id, { travelDetailsRequired: e.target.checked })} className="size-4 accent-brand-700" />
                Travel details required
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={guest.elderlyAssistanceRequired}
                  onChange={(e) => updateGuest(guest.id, { elderlyAssistanceRequired: e.target.checked })}
                  className="size-4 accent-brand-700"
                />
                Elderly assistance required
              </label>
            </div>
            <Field>
              <Label htmlFor="g-accessibility">Accessibility requirements</Label>
              <Input
                id="g-accessibility"
                defaultValue={guest.accessibilityRequirements ?? ''}
                key={`accessibility-${guest.id}`}
                onBlur={(e) => updateGuest(guest.id, { accessibilityRequirements: e.target.value || undefined })}
              />
            </Field>
            <Field>
              <Label htmlFor="g-infant">Infant requirements</Label>
              <Input id="g-infant" defaultValue={guest.infantRequirements ?? ''} key={`infant-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { infantRequirements: e.target.value || undefined })} />
            </Field>
            <Field>
              <Label htmlFor="g-plusone">Plus-one status</Label>
              <Select id="g-plusone" value={guest.plusOneStatus} onChange={(e) => updateGuest(guest.id, { plusOneStatus: e.target.value as typeof guest.plusOneStatus })}>
                {PLUS_ONE_STATUSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Logistics</p>
            <GuestLogisticsSection guestId={guest.id} />
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <Field>
              <Label htmlFor="g-notes">Notes</Label>
              <Textarea id="g-notes" defaultValue={guest.notes ?? ''} key={`notes-${guest.id}`} onBlur={(e) => updateGuest(guest.id, { notes: e.target.value || undefined })} />
            </Field>
          </section>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line-soft text-xs text-ink-faint">
            <div>Created {formatDisplayDate(guest.createdAt)}</div>
            <div>Updated {formatDisplayDate(guest.updatedAt)}</div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete guest"
        message={`Are you sure you want to delete "${guest.fullName}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
