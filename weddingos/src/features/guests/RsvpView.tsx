import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { GuestEvent, HouseholdRsvpState } from '@/types';
import { HOUSEHOLD_RSVP_STATES } from '@/types';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { householdRsvpSummary } from '@/utils/rsvpLogic';
import { RsvpHouseholdRow } from './RsvpHouseholdRow';
import { FollowUpQueueSection } from './FollowUpQueueSection';

const GROUP_DESCRIPTIONS: Record<HouseholdRsvpState, string> = {
  Attending: 'Every invited member has confirmed Attending.',
  Declined: 'Every invited member has responded Declined.',
  Partial: 'A mix of responses — some attending, declined, maybe, or still pending.',
  Pending: 'No member has given a final response yet.',
};

export function RsvpView() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const [event, setEvent] = useState<GuestEvent>('Wedding');
  const [view, setView] = useState<'household' | 'followup'>('household');

  const invitedToEvent = households.filter((h) => h.invitedEvents.includes(event));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-line p-1">
          {(['household', 'followup'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === v ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
            >
              {v === 'household' ? 'By Household' : 'Follow-Up Queue'}
            </button>
          ))}
        </div>

        {view === 'household' && (
          <div className="flex rounded-lg border border-line p-1">
            {(['Wedding', 'Engagement'] as const).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEvent(e)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${event === e ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'followup' && <FollowUpQueueSection />}

      {view === 'household' &&
        (invitedToEvent.length === 0 ? (
          <EmptyState title={`No households invited to ${event}`} description="Adjust household invitations to see them here." />
        ) : (
          HOUSEHOLD_RSVP_STATES.map((state) => {
            const group = invitedToEvent.filter((h) => householdRsvpSummary(h, guests, event) === state);
            if (group.length === 0) return null;
            return (
              <Card key={state}>
                <CardHeader>
                  <div>
                    <CardTitle>{state}</CardTitle>
                    <p className="text-xs text-ink-faint mt-0.5">{GROUP_DESCRIPTIONS[state]}</p>
                  </div>
                  <span className="text-xs font-medium text-ink-faint">{group.length}</span>
                </CardHeader>
                <CardBody className="p-0">
                  <ul className="divide-y divide-line-soft">
                    {group.map((household) => (
                      <RsvpHouseholdRow key={household.id} household={household} event={event} />
                    ))}
                  </ul>
                </CardBody>
              </Card>
            );
          })
        ))}
    </div>
  );
}
