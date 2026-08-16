import { useState } from 'react';
import { Check, ClipboardCheck, X } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, Label } from '@/components/ui/Field';
import { useSettings } from '@/hooks/useSettings';
import { useTasks } from '@/hooks/useTasks';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useVendors } from '@/hooks/useVendors';
import { useGuests } from '@/hooks/useGuests';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useManifestFreezeState } from '@/hooks/useManifestFreezeStates';
import { useFinalReadinessReviews } from '@/hooks/useFinalReadinessReviews';
import { buildFinalReadinessExceptions, buildFinalReadinessSnapshot } from '@/utils/finalReadinessLogic';
import { daysUntil } from '@/utils/date';

export function FinalReadinessLock() {
  const { settings } = useSettings();
  const { tasks } = useTasks();
  const { churchRequirements } = useChurchRequirements();
  const { ceremonyItems } = useCeremonyItems();
  const { vendors } = useVendors();
  const { guests } = useGuests();
  const { cateringPlans } = useCateringPlans();
  const { dutyAssignments } = useDutyAssignments();
  const { runSheetItems } = useRunSheet();
  const { emergencyContacts } = useEmergencyContacts();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { liveIssues } = useLiveIssues();
  const roomingListFreeze = useManifestFreezeState('Rooming List');
  const pickupFreeze = useManifestFreezeState('Pickup Manifest');
  const dropFreeze = useManifestFreezeState('Drop Manifest');
  const { finalReadinessReviews, addFinalReadinessReview } = useFinalReadinessReviews();
  const [reviewerName, setReviewerName] = useState('');

  const referenceDate = (settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString()).slice(0, 10);
  const daysLeft = daysUntil(settings.wedding.date, new Date(referenceDate));
  const withinWindow = daysLeft !== null && daysLeft <= 2;

  const snapshot = buildFinalReadinessSnapshot({
    tasks,
    churchRequirements,
    ceremonyItems,
    vendors,
    guests,
    cateringPlans,
    roomingListStable: Boolean(roomingListFreeze?.frozen),
    pickupDropStable: Boolean(pickupFreeze?.frozen && dropFreeze?.frozen),
    dutyAssignments,
    runSheetItems,
    emergencyContacts,
    paymentSchedules,
    payments,
    liveIssues,
    weddingDate: settings.wedding.date,
    referenceDate,
  });
  const exceptions = buildFinalReadinessExceptions(snapshot);
  const lastReview = [...finalReadinessReviews].sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))[0];

  function handleReview() {
    if (!reviewerName.trim()) return;
    addFinalReadinessReview({
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName.trim(),
      readinessSnapshot: snapshot,
      unresolvedExceptions: exceptions,
    });
    setReviewerName('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final readiness lock</CardTitle>
        {daysLeft !== null && <Badge tone={withinWindow ? 'warning' : 'neutral'}>{daysLeft} day{daysLeft === 1 ? '' : 's'} to go</Badge>}
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-sm text-ink-faint">
          A point-in-time check across every module — review this 24-48 hours before the wedding. Unresolved items don't block anything; they're a checklist to work through.
        </p>

        <ul className="divide-y divide-line-soft">
          {snapshot.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
              <div className="flex items-start gap-2">
                {item.ready ? <Check className="size-4 shrink-0 mt-0.5 text-success" aria-hidden="true" /> : <X className="size-4 shrink-0 mt-0.5 text-critical" aria-hidden="true" />}
                <div>
                  <p className="text-sm text-ink">{item.label}</p>
                  <p className="text-xs text-ink-faint">{item.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {lastReview && (
          <p className="text-xs text-ink-faint">
            Last reviewed by {lastReview.reviewedBy} at {new Date(lastReview.reviewedAt).toLocaleString('en-IN')} — {lastReview.unresolvedExceptions.length} unresolved exception{lastReview.unresolvedExceptions.length === 1 ? '' : 's'} at that time.
          </p>
        )}

        <div className="flex items-end gap-2 pt-1">
          <Field className="max-w-[14rem]">
            <Label htmlFor="frr-reviewer">Your name</Label>
            <Input id="frr-reviewer" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
          </Field>
          <Button variant="primary" icon={<ClipboardCheck className="size-4" aria-hidden="true" />} onClick={handleReview} disabled={!reviewerName.trim()}>
            Mark final readiness reviewed
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
