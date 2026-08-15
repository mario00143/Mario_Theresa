import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { computeAccessibilityReport } from '@/utils/guestStats';

export function AccessibilityReportPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { openGuestDetail } = useUI();
  const rows = computeAccessibilityReport(guests, households);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility &amp; special assistance</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No accessibility needs recorded" />
        ) : (
          <ul className="divide-y divide-line-soft">
            {rows.map(({ guest, household, reasons }) => (
              <li key={guest.id}>
                <button type="button" onClick={() => openGuestDetail(guest.id)} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-surface-subtle">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{guest.fullName}</p>
                    <p className="text-xs text-ink-faint mt-0.5 truncate">{household?.householdName ?? '—'}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {reasons.map((reason) => (
                        <li key={reason} className="text-xs text-ink-soft">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
