import { useState } from 'react';
import type { GuestEvent, Household, RsvpStatus } from '@/types';
import { RSVP_STATUSES } from '@/types';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { getHouseholdMembersForEvent, getGuestRsvpStatus } from '@/utils/rsvpLogic';

export function HouseholdRsvpEditor({ household, defaultEvent }: { household: Household; defaultEvent?: GuestEvent }) {
  const { guests, setGuestRsvpStatus, bulkSetHouseholdRsvpStatus, resetHouseholdRsvpToPending } = useGuests();
  const { openGuestDetail } = useUI();
  const initialEvent = defaultEvent && household.invitedEvents.includes(defaultEvent) ? defaultEvent : household.invitedEvents[0];
  const [activeEvent, setActiveEvent] = useState<GuestEvent | undefined>(initialEvent);

  if (household.invitedEvents.length === 0) {
    return <p className="text-sm text-ink-faint">This household is not invited to any event yet.</p>;
  }

  const event = activeEvent ?? household.invitedEvents[0];
  const members = getHouseholdMembersForEvent(household, guests, event);

  return (
    <div>
      {household.invitedEvents.length > 1 && (
        <div className="mb-3 flex rounded-lg border border-line p-1 w-fit">
          {household.invitedEvents.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setActiveEvent(e)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${event === e ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-ink-faint">No household members are invited to {event}.</p>
      ) : (
        <>
          <ul className="space-y-1.5 mb-3">
            {members.map((guest) => (
              <li key={guest.id} className="flex items-center gap-2 rounded-lg border border-line-soft px-3 py-2">
                <button type="button" onClick={() => openGuestDetail(guest.id)} className="flex-1 text-left text-sm text-ink hover:underline truncate">
                  {guest.fullName}
                </button>
                <Select
                  aria-label={`RSVP status for ${guest.fullName} — ${event}`}
                  value={getGuestRsvpStatus(guest, event)}
                  onChange={(e2) => setGuestRsvpStatus(guest.id, event, e2.target.value as RsvpStatus)}
                  className="w-auto! h-8 text-xs"
                >
                  {RSVP_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => bulkSetHouseholdRsvpStatus(household.id, event, 'Attending')}>
              Mark all Attending
            </Button>
            <Button variant="secondary" size="sm" onClick={() => bulkSetHouseholdRsvpStatus(household.id, event, 'Declined')}>
              Mark all Declined
            </Button>
            <Button variant="ghost" size="sm" onClick={() => resetHouseholdRsvpToPending(household.id, event)}>
              Reset all to Pending
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
