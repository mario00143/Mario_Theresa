import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import type { Household } from '@/types';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { formatDisplayDate } from '@/utils/date';
import { daysSinceSent, isFollowUpOverdue, needsRsvpFollowUp } from '@/utils/invitationLogic';
import { householdPrimaryRsvpState } from '@/utils/rsvpLogic';
import { HouseholdRsvpBadge } from './GuestBadges';

function FollowUpRow({ household }: { household: Household }) {
  const { guests } = useGuests();
  const { recordFollowUp } = useHouseholds();
  const { openHouseholdDetail } = useUI();
  const [editing, setEditing] = useState(false);
  const [nextDate, setNextDate] = useState(household.nextFollowUpAt ?? '');
  const [notes, setNotes] = useState(household.followUpNotes ?? '');

  const overdue = isFollowUpOverdue(household);
  const days = daysSinceSent(household);

  const save = () => {
    recordFollowUp(household.id, { nextFollowUpAt: nextDate || undefined, followUpNotes: notes || undefined });
    setEditing(false);
  };

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <button type="button" onClick={() => openHouseholdDetail(household.id)} className="min-w-0 text-left">
          <p className="text-sm font-medium text-ink truncate">{household.householdName}</p>
          <p className="text-xs text-ink-faint mt-0.5">
            {household.primaryContactName || 'No contact'} · {household.primaryPhone || 'No phone'}
          </p>
        </button>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{household.invitationStatus}</Badge>
          <HouseholdRsvpBadge state={householdPrimaryRsvpState(household, guests)} />
          {overdue && <Badge tone="danger">Follow-up overdue</Badge>}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">
        {days !== null ? `Sent ${days} day${days === 1 ? '' : 's'} ago` : 'Send date not recorded'} · Owner: {household.rsvpFollowUpOwner ?? '—'} · Last
        contact: {formatDisplayDate(household.lastFollowUpAt)} · Next: {formatDisplayDate(household.nextFollowUpAt)}
      </p>

      {!editing ? (
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => recordFollowUp(household.id, {})}>
            Mark Followed Up
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Set next follow-up
          </Button>
        </div>
      ) : (
        <div className="mt-2 space-y-2 rounded-lg border border-line-soft p-3">
          <Field>
            <Label htmlFor={`followup-date-${household.id}`}>Next follow-up date</Label>
            <Input id={`followup-date-${household.id}`} type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor={`followup-notes-${household.id}`}>Follow-up notes</Label>
            <Textarea id={`followup-notes-${household.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={save}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

export function FollowUpQueueSection() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const queue = households.filter((h) => needsRsvpFollowUp(h, guests));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-up queue</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{queue.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {queue.length === 0 ? (
          <EmptyState title="Nothing needs follow-up" description="Every sent or delivered invitation has a resolved RSVP." />
        ) : (
          <ul className="divide-y divide-line-soft">
            {queue.map((household) => (
              <FollowUpRow key={household.id} household={household} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
