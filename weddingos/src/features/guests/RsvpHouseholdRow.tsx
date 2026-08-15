import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { GuestEvent, Household } from '@/types';
import { useUI } from '@/context/UIContext';
import { HouseholdRsvpEditor } from './HouseholdRsvpEditor';

export function RsvpHouseholdRow({ household, event }: { household: Household; event: GuestEvent }) {
  const { openHouseholdDetail } = useUI();
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setExpanded((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {expanded ? <ChevronDown className="size-4 shrink-0 text-ink-faint" aria-hidden="true" /> : <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />}
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{household.householdName}</p>
            <p className="text-xs text-ink-faint truncate">{household.primaryContactName || 'No contact'}</p>
          </div>
        </button>
        <button type="button" onClick={() => openHouseholdDetail(household.id)} className="shrink-0 text-xs text-brand-700 hover:underline">
          Open household
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pl-6">
          <HouseholdRsvpEditor household={household} defaultEvent={event} />
        </div>
      )}
    </li>
  );
}
