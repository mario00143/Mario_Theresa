import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { CeremonyParticipantRole, CeremonySequenceStatus } from '@/types';
import { CEREMONY_PARTICIPANT_ROLES, CEREMONY_SEQUENCE_STATUSES, HOUSEHOLD_SIDES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useCeremonySequence } from '@/hooks/useCeremonySequence';

function ParticipantRow({ participantId }: { participantId: string }) {
  const { ceremonyParticipants, updateCeremonyParticipant, deleteCeremonyParticipant } = useCeremonyParticipants();
  const participant = ceremonyParticipants.find((p) => p.id === participantId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!participant) return null;

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{participant.name || 'Unnamed'}</span>
          <Badge tone="neutral">{participant.role}</Badge>
          <Badge tone={participant.confirmed ? 'success' : 'warning'}>{participant.confirmed ? 'Confirmed' : 'Not confirmed'}</Badge>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Remove participant "${participant.name}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`p-name-${participant.id}`}>Name</Label>
          <Input id={`p-name-${participant.id}`} defaultValue={participant.name} key={`p-name-${participant.id}`} onBlur={(e) => updateCeremonyParticipant(participant.id, { name: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`p-role-${participant.id}`}>Role</Label>
          <Select id={`p-role-${participant.id}`} value={participant.role} onChange={(e) => updateCeremonyParticipant(participant.id, { role: e.target.value as CeremonyParticipantRole })}>
            {CEREMONY_PARTICIPANT_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`p-side-${participant.id}`}>Side</Label>
          <Select
            id={`p-side-${participant.id}`}
            value={participant.side ?? ''}
            onChange={(e) => updateCeremonyParticipant(participant.id, { side: (e.target.value || undefined) as (typeof HOUSEHOLD_SIDES)[number] | undefined })}
          >
            <option value="">—</option>
            {HOUSEHOLD_SIDES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`p-phone-${participant.id}`}>Phone</Label>
          <Input id={`p-phone-${participant.id}`} defaultValue={participant.phone ?? ''} key={`p-phone-${participant.id}`} onBlur={(e) => updateCeremonyParticipant(participant.id, { phone: e.target.value || undefined })} />
        </Field>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={participant.confirmed} onChange={(e) => updateCeremonyParticipant(participant.id, { confirmed: e.target.checked })} className="size-4 accent-brand-700" />
          Confirmed
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={participant.rehearsalRequired}
            onChange={(e) => updateCeremonyParticipant(participant.id, { rehearsalRequired: e.target.checked })}
            className="size-4 accent-brand-700"
          />
          Rehearsal required
        </label>
        {participant.rehearsalRequired && (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={participant.rehearsalConfirmed}
              onChange={(e) => updateCeremonyParticipant(participant.id, { rehearsalConfirmed: e.target.checked })}
              className="size-4 accent-brand-700"
            />
            Rehearsal confirmed
          </label>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove participant"
        message={`Remove "${participant.name}"? This will also remove them from any ceremony sequence steps. This cannot be undone.`}
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          deleteCeremonyParticipant(participant.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function SequenceRow({ itemId, isFirst, isLast }: { itemId: string; isFirst: boolean; isLast: boolean }) {
  const { sequenceItems, updateCeremonySequenceItem, deleteCeremonySequenceItem, reorderCeremonySequenceItem } = useCeremonySequence();
  const item = sequenceItems.find((s) => s.id === itemId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!item) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-line-soft p-3">
      <div className="flex flex-col gap-1 pt-0.5">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => reorderCeremonySequenceItem(item.id, 'up')}
          aria-label={`Move "${item.title}" earlier`}
          className="rounded-md p-1 text-ink-faint hover:bg-surface-muted hover:text-ink disabled:opacity-30"
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => reorderCeremonySequenceItem(item.id, 'down')}
          aria-label={`Move "${item.title}" later`}
          className="rounded-md p-1 text-ink-faint hover:bg-surface-muted hover:text-ink disabled:opacity-30"
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-ink">{item.title}</span>
            <Badge tone={item.status === 'Complete' ? 'success' : item.status === 'Rehearsed' ? 'neutral' : 'warning'}>{item.status}</Badge>
            {item.plannedTime && <span className="text-xs text-ink-faint">{item.plannedTime}</span>}
          </div>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete step "${item.title}"`}
            className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Field>
            <Label htmlFor={`s-title-${item.id}`}>Title</Label>
            <Input id={`s-title-${item.id}`} defaultValue={item.title} key={`s-title-${item.id}`} onBlur={(e) => updateCeremonySequenceItem(item.id, { title: e.target.value })} />
          </Field>
          <Field>
            <Label htmlFor={`s-time-${item.id}`}>Planned time</Label>
            <Input id={`s-time-${item.id}`} type="time" defaultValue={item.plannedTime ?? ''} key={`s-time-${item.id}`} onBlur={(e) => updateCeremonySequenceItem(item.id, { plannedTime: e.target.value || undefined })} />
          </Field>
          <Field>
            <Label htmlFor={`s-location-${item.id}`}>Location</Label>
            <Input id={`s-location-${item.id}`} defaultValue={item.location ?? ''} key={`s-location-${item.id}`} onBlur={(e) => updateCeremonySequenceItem(item.id, { location: e.target.value || undefined })} />
          </Field>
          <Field>
            <Label htmlFor={`s-status-${item.id}`}>Status</Label>
            <Select id={`s-status-${item.id}`} value={item.status} onChange={(e) => updateCeremonySequenceItem(item.id, { status: e.target.value as CeremonySequenceStatus })}>
              {CEREMONY_SEQUENCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete sequence step"
        message={`Delete "${item.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteCeremonySequenceItem(item.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function CeremonyView() {
  const { ceremonyParticipants, addCeremonyParticipant } = useCeremonyParticipants();
  const { sequenceItems, addCeremonySequenceItem } = useCeremonySequence();
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    addCeremonyParticipant({ role: 'Other', name: newParticipantName.trim(), confirmed: false, rehearsalRequired: true, rehearsalConfirmed: false });
    setNewParticipantName('');
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    addCeremonySequenceItem({ sequenceOrder: sequenceItems.length + 1, title: newStepTitle.trim(), status: 'Planned' });
    setNewStepTitle('');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Participants ({ceremonyParticipants.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {ceremonyParticipants.length === 0 ? (
            <EmptyState title="No participants yet" description="Add roles like Groom, Bride, witnesses, readers, and custodians." />
          ) : (
            <div className="space-y-3">
              {ceremonyParticipants.map((p) => (
                <ParticipantRow key={p.id} participantId={p.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} placeholder="New participant name…" aria-label="New participant name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddParticipant} disabled={!newParticipantName.trim()}>
              Add Participant
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ceremony sequence ({sequenceItems.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {sequenceItems.length === 0 ? (
            <EmptyState title="No sequence steps yet" description="Build the order of service using the up/down controls to reorder." />
          ) : (
            <div className="space-y-2.5">
              {sequenceItems.map((item, index) => (
                <SequenceRow key={item.id} itemId={item.id} isFirst={index === 0} isLast={index === sequenceItems.length - 1} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newStepTitle} onChange={(e) => setNewStepTitle(e.target.value)} placeholder="New sequence step title…" aria-label="New sequence step title" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddStep} disabled={!newStepTitle.trim()}>
              Add Step
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
