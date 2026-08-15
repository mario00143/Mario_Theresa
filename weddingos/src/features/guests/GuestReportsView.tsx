import { useState } from 'react';
import { cn } from '@/lib/cn';
import { InvitationReportPanel } from './reports/InvitationReportPanel';
import { RsvpReportPanel } from './reports/RsvpReportPanel';
import { MealCountPanel } from './reports/MealCountPanel';
import { AccommodationReportPanel } from './reports/AccommodationReportPanel';
import { PickupReportPanel } from './reports/PickupReportPanel';
import { AccessibilityReportPanel } from './reports/AccessibilityReportPanel';
import { DataIssuesPanel } from './reports/DataIssuesPanel';

const TABS = [
  { key: 'invitations', label: 'Invitations', Component: InvitationReportPanel },
  { key: 'rsvp', label: 'RSVP', Component: RsvpReportPanel },
  { key: 'meals', label: 'Meal Count', Component: MealCountPanel },
  { key: 'accommodation', label: 'Accommodation', Component: AccommodationReportPanel },
  { key: 'pickup', label: 'Pickup', Component: PickupReportPanel },
  { key: 'accessibility', label: 'Accessibility', Component: AccessibilityReportPanel },
  { key: 'data-issues', label: 'Data Issues', Component: DataIssuesPanel },
] as const;

export function GuestReportsView() {
  const [active, setActive] = useState<(typeof TABS)[number]['key']>('invitations');
  const ActivePanel = TABS.find((t) => t.key === active)?.Component ?? InvitationReportPanel;

  return (
    <div className="space-y-4">
      <nav aria-label="Report sections" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
              active === tab.key ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-faint hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <ActivePanel />
    </div>
  );
}
