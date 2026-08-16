import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AttireItemCategory, AttireItemStatus, AttireOutfitType, AttireStatus, EventScope, GroomingStatus, GroomingType } from '@/types';
import { ATTIRE_ITEM_CATEGORIES, ATTIRE_ITEM_STATUSES, ATTIRE_OUTFIT_TYPES, ATTIRE_STATUSES, EVENTS, GROOMING_STATUSES, GROOMING_TYPES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useAttireItems } from '@/hooks/useAttireItems';
import { useGroomingAppointments } from '@/hooks/useGroomingAppointments';
import { useVendors } from '@/hooks/useVendors';
import { useSettings } from '@/hooks/useSettings';
import { computeAttireProfileWarnings, isAttireReady } from '@/utils/attireLogic';
import { weddingDateTimeISO } from '@/utils/date';

function AttireItemRow({ itemId }: { itemId: string }) {
  const { attireItems, updateAttireItem, deleteAttireItem } = useAttireItems();
  const item = attireItems.find((i) => i.id === itemId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!item) return null;

  return (
    <div className="rounded-lg border border-line-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{item.itemName}</span>
          <Badge tone="neutral">{item.category}</Badge>
          <Badge tone={item.status === 'Ready' || item.status === 'Packed' ? 'success' : item.required ? 'warning' : 'neutral'}>{item.status}</Badge>
          {item.required && <Badge tone="neutral">Required</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete item "${item.itemName}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`ai-name-${item.id}`}>Item name</Label>
          <Input id={`ai-name-${item.id}`} defaultValue={item.itemName} key={`ai-name-${item.id}`} onBlur={(e) => updateAttireItem(item.id, { itemName: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`ai-category-${item.id}`}>Category</Label>
          <Select id={`ai-category-${item.id}`} value={item.category} onChange={(e) => updateAttireItem(item.id, { category: e.target.value as AttireItemCategory })}>
            {ATTIRE_ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ai-status-${item.id}`}>Status</Label>
          <Select id={`ai-status-${item.id}`} value={item.status} onChange={(e) => updateAttireItem(item.id, { status: e.target.value as AttireItemStatus })}>
            {ATTIRE_ITEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end gap-4 pb-2.5">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={item.required} onChange={(e) => updateAttireItem(item.id, { required: e.target.checked })} className="size-4 accent-brand-700" />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={item.backupAvailable} onChange={(e) => updateAttireItem(item.id, { backupAvailable: e.target.checked })} className="size-4 accent-brand-700" />
            Backup available
          </label>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete attire item"
        message={`Delete "${item.itemName}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteAttireItem(item.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function ProfileCard({ profileId }: { profileId: string }) {
  const { attireProfiles, updateAttireProfile, deleteAttireProfile } = useAttireProfiles();
  const { attireItems, addAttireItem } = useAttireItems();
  const { vendors } = useVendors();
  const { settings } = useSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const profile = attireProfiles.find((p) => p.id === profileId);
  if (!profile) return null;
  const profileItems = attireItems.filter((i) => i.attireProfileId === profile.id);

  const eventDate = profile.event === 'Engagement' ? settings.engagement.date : settings.wedding.date;
  const eventDateTimeISO = profile.event === 'Engagement' ? `${settings.engagement.date}T${settings.engagement.startTime || '00:00'}:00` : weddingDateTimeISO(settings);
  const warnings = computeAttireProfileWarnings(profile, profileItems, eventDate, eventDateTimeISO);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addAttireItem({ attireProfileId: profile.id, itemName: newItemName.trim(), category: 'Other', required: false, status: 'Not Started', backupAvailable: false });
    setNewItemName('');
  };

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">
            {profile.personRole} — {profile.outfitType}
          </span>
          <Badge tone={isAttireReady(profile) ? 'success' : 'warning'}>{profile.status}</Badge>
          <Badge tone="neutral">{profile.event}</Badge>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete attire profile for "${profile.personRole}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {warnings.length > 0 && (
        <ul className="list-disc list-inside space-y-0.5">
          {warnings.map((w) => (
            <li key={w} className="text-xs text-warning">
              {w}
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`ap-role-${profile.id}`}>Person role</Label>
          <Input id={`ap-role-${profile.id}`} defaultValue={profile.personRole} key={`ap-role-${profile.id}`} onBlur={(e) => updateAttireProfile(profile.id, { personRole: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`ap-outfit-${profile.id}`}>Outfit type</Label>
          <Select id={`ap-outfit-${profile.id}`} value={profile.outfitType} onChange={(e) => updateAttireProfile(profile.id, { outfitType: e.target.value as AttireOutfitType })}>
            {ATTIRE_OUTFIT_TYPES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ap-event-${profile.id}`}>Event</Label>
          <Select id={`ap-event-${profile.id}`} value={profile.event} onChange={(e) => updateAttireProfile(profile.id, { event: e.target.value as EventScope })}>
            {EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ap-vendor-${profile.id}`}>Vendor</Label>
          <Select id={`ap-vendor-${profile.id}`} value={profile.vendorId ?? ''} onChange={(e) => updateAttireProfile(profile.id, { vendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`ap-status-${profile.id}`}>Status</Label>
          <Select id={`ap-status-${profile.id}`} value={profile.status} onChange={(e) => updateAttireProfile(profile.id, { status: e.target.value as AttireStatus })}>
            {ATTIRE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ap-firstfitting-${profile.id}`}>First fitting date</Label>
          <Input
            id={`ap-firstfitting-${profile.id}`}
            type="date"
            defaultValue={profile.firstFittingDate ?? ''}
            key={`ap-firstfitting-${profile.id}`}
            onBlur={(e) => updateAttireProfile(profile.id, { firstFittingDate: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`ap-finalfitting-${profile.id}`}>Final fitting date</Label>
          <Input
            id={`ap-finalfitting-${profile.id}`}
            type="date"
            defaultValue={profile.finalFittingDate ?? ''}
            key={`ap-finalfitting-${profile.id}`}
            onBlur={(e) => updateAttireProfile(profile.id, { finalFittingDate: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`ap-ready-${profile.id}`}>Ready date</Label>
          <Input id={`ap-ready-${profile.id}`} type="date" defaultValue={profile.readyDate ?? ''} key={`ap-ready-${profile.id}`} onBlur={(e) => updateAttireProfile(profile.id, { readyDate: e.target.value || undefined })} />
        </Field>
      </div>

      <Field>
        <Label htmlFor={`ap-storage-${profile.id}`}>Storage location</Label>
        <Input
          id={`ap-storage-${profile.id}`}
          defaultValue={profile.storageLocation ?? ''}
          key={`ap-storage-${profile.id}`}
          onBlur={(e) => updateAttireProfile(profile.id, { storageLocation: e.target.value || undefined })}
        />
      </Field>

      <div className="border-t border-line-soft pt-3 space-y-2.5">
        <p className="text-xs font-semibold text-ink">Items ({profileItems.length})</p>
        {profileItems.map((i) => (
          <AttireItemRow key={i.id} itemId={i.id} />
        ))}
        <div className="flex gap-2">
          <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="New item name…" aria-label="New attire item name" />
          <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddItem} disabled={!newItemName.trim()}>
            Add
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete attire profile"
        message={`Delete this attire profile for "${profile.personRole}"? Its items will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteAttireProfile(profile.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function GroomingRow({ appointmentId }: { appointmentId: string }) {
  const { groomingAppointments, updateGroomingAppointment, deleteGroomingAppointment } = useGroomingAppointments();
  const { vendors } = useVendors();
  const appointment = groomingAppointments.find((a) => a.id === appointmentId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!appointment) return null;

  return (
    <div className="rounded-lg border border-line-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">
            {appointment.personRole} — {appointment.type}
          </span>
          <Badge tone={appointment.status === 'Completed' || appointment.status === 'Confirmed' ? 'success' : 'neutral'}>{appointment.status}</Badge>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete grooming appointment" className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Field>
          <Label htmlFor={`ga-role-${appointment.id}`}>Person role</Label>
          <Input id={`ga-role-${appointment.id}`} defaultValue={appointment.personRole} key={`ga-role-${appointment.id}`} onBlur={(e) => updateGroomingAppointment(appointment.id, { personRole: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`ga-type-${appointment.id}`}>Type</Label>
          <Select id={`ga-type-${appointment.id}`} value={appointment.type} onChange={(e) => updateGroomingAppointment(appointment.id, { type: e.target.value as GroomingType })}>
            {GROOMING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ga-date-${appointment.id}`}>Date</Label>
          <Input id={`ga-date-${appointment.id}`} type="date" defaultValue={appointment.date ?? ''} key={`ga-date-${appointment.id}`} onBlur={(e) => updateGroomingAppointment(appointment.id, { date: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`ga-status-${appointment.id}`}>Status</Label>
          <Select id={`ga-status-${appointment.id}`} value={appointment.status} onChange={(e) => updateGroomingAppointment(appointment.id, { status: e.target.value as GroomingStatus })}>
            {GROOMING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ga-vendor-${appointment.id}`}>Vendor</Label>
          <Select id={`ga-vendor-${appointment.id}`} value={appointment.vendorId ?? ''} onChange={(e) => updateGroomingAppointment(appointment.id, { vendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete grooming appointment"
        message="Delete this grooming appointment? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteGroomingAppointment(appointment.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function AttireView() {
  const { attireProfiles, addAttireProfile } = useAttireProfiles();
  const { groomingAppointments, addGroomingAppointment } = useGroomingAppointments();
  const [newProfileRole, setNewProfileRole] = useState('');
  const [newGroomingRole, setNewGroomingRole] = useState('');

  const handleAddProfile = () => {
    if (!newProfileRole.trim()) return;
    addAttireProfile({ personRole: newProfileRole.trim(), event: 'Wedding', outfitType: 'Other', status: 'Researching' });
    setNewProfileRole('');
  };

  const handleAddGrooming = () => {
    if (!newGroomingRole.trim()) return;
    addGroomingAppointment({ personRole: newGroomingRole.trim(), type: 'Other', status: 'Planned' });
    setNewGroomingRole('');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Attire profiles ({attireProfiles.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {attireProfiles.length === 0 ? (
            <EmptyState title="No attire profiles yet" description="Add a profile per person and event, e.g. Groom / Wedding." />
          ) : (
            <div className="space-y-3">
              {attireProfiles.map((p) => (
                <ProfileCard key={p.id} profileId={p.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newProfileRole} onChange={(e) => setNewProfileRole(e.target.value)} placeholder="New profile person role…" aria-label="New attire profile person role" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddProfile} disabled={!newProfileRole.trim()}>
              Add Profile
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grooming appointments ({groomingAppointments.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {groomingAppointments.length === 0 ? (
            <EmptyState title="No grooming appointments yet" description="Add haircut, makeup, styling, and other appointments." />
          ) : (
            <div className="space-y-2.5">
              {groomingAppointments.map((a) => (
                <GroomingRow key={a.id} appointmentId={a.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newGroomingRole} onChange={(e) => setNewGroomingRole(e.target.value)} placeholder="Person role for new appointment…" aria-label="New grooming appointment person role" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddGrooming} disabled={!newGroomingRole.trim()}>
              Add Appointment
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
