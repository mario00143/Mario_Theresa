import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { computeAccommodationReport } from '@/utils/guestStats';

export function AccommodationReportPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { openGuestDetail } = useUI();
  const rows = computeAccommodationReport(guests, households);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accommodation requirements</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No accommodation requests" description="No confirmed-attending guests currently require accommodation." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Household</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Age category</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ guest, household }) => (
                  <tr key={guest.id} onClick={() => openGuestDetail(guest.id)} className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{guest.fullName}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household?.householdName ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household?.city ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household?.primaryPhone ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{guest.ageCategory}</td>
                    <td className="px-4 py-3 text-ink-soft max-w-[16rem] truncate">{guest.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
