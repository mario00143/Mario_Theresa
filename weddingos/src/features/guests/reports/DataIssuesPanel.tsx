import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { detectDataIssues } from '@/utils/guestDataQuality';

export function DataIssuesPanel() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { openHouseholdDetail, openGuestDetail } = useUI();
  const issues = detectDataIssues(households, guests);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest data issues</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{issues.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {issues.length === 0 ? (
          <EmptyState title="No data quality issues" description="Households and guests all pass the automated checks." />
        ) : (
          <ul className="divide-y divide-line-soft max-h-[32rem] overflow-y-auto">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => (issue.linkType === 'household' ? openHouseholdDetail(issue.linkId) : openGuestDetail(issue.linkId))}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-surface-subtle"
                >
                  <TriangleAlert className="size-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
                  <span className="text-sm text-ink">{issue.message}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
