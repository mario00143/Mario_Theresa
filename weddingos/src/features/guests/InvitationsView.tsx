import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { Household, InvitationStatus } from '@/types';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { formatDisplayDate } from '@/utils/date';
import { InvitationBulkActionsBar } from './InvitationBulkActionsBar';

const SECTION_ORDER: InvitationStatus[] = ['Not Prepared', 'Ready', 'Sent', 'Delivered', 'Follow-up Required', 'Complete'];

function InvitationGroup({ status, households, guestCountByHousehold, selected, onToggle }: {
  status: InvitationStatus;
  households: Household[];
  guestCountByHousehold: Map<string, number>;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { openHouseholdDetail } = useUI();
  const { markReady, markSent, markDelivered, markFollowUpRequired, markComplete } = useHouseholds();

  if (households.length === 0) return null;

  const actionFor = (id: string) => ({
    Ready: () => markReady(id),
    Sent: () => markSent(id),
    Delivered: () => markDelivered(id),
    'Follow-up Required': () => markFollowUpRequired(id),
    Complete: () => markComplete(id),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{status}</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{households.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="divide-y divide-line-soft">
          {households.map((household) => {
            const actions = actionFor(household.id);
            return (
              <li key={household.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.has(household.id)}
                    onChange={() => onToggle(household.id)}
                    className="mt-1 size-4 shrink-0 accent-brand-700"
                    aria-label={`Select ${household.householdName}`}
                  />
                  <button type="button" onClick={() => openHouseholdDetail(household.id)} className="min-w-0 text-left">
                    <p className="text-sm font-medium text-ink truncate">{household.householdName}</p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      {household.primaryContactName || 'No contact'} · {guestCountByHousehold.get(household.id) ?? 0} member(s) · {household.invitedEvents.join(', ') || 'No events'}
                    </p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      Method: {household.invitationMethod.join(', ') || '—'} · Owner: {household.invitationOwner ?? '—'}
                      {household.sentAt && ` · Sent ${formatDisplayDate(household.sentAt)}`}
                    </p>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {(Object.keys(actions) as (keyof typeof actions)[])
                    .filter((label) => label !== status)
                    .map((label) => (
                      <Button key={label} size="sm" variant="secondary" onClick={actions[label]}>
                        {label === status ? label : `Mark ${label}`}
                      </Button>
                    ))}
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}

export function InvitationsView() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const guestCountByHousehold = new Map<string, number>();
  for (const guest of guests) {
    guestCountByHousehold.set(guest.householdId, (guestCountByHousehold.get(guest.householdId) ?? 0) + 1);
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (households.length === 0) {
    return <EmptyState title="No households yet" description="Add a household to start tracking invitations." />;
  }

  return (
    <div className="space-y-5 pb-4">
      {SECTION_ORDER.map((status) => (
        <InvitationGroup
          key={status}
          status={status}
          households={households.filter((h) => h.invitationStatus === status)}
          guestCountByHousehold={guestCountByHousehold}
          selected={selected}
          onToggle={toggle}
        />
      ))}

      <InvitationBulkActionsBar selectedIds={Array.from(selected)} onClear={() => setSelected(new Set())} />
    </div>
  );
}
