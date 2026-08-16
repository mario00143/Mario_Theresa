import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useSettings } from '@/hooks/useSettings';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useVendorDayStatuses } from '@/hooks/useVendorDayStatuses';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useCloseoutItems } from '@/hooks/useCloseoutItems';
import { useTasks } from '@/hooks/useTasks';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useVendors } from '@/hooks/useVendors';
import { useGuests } from '@/hooks/useGuests';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { daysUntil } from '@/utils/date';
import { criticalOpenLiveIssues } from '@/utils/liveIssueLogic';
import { hasVendorArrived } from '@/utils/vendorDayLogic';
import { isCriticalCeremonyItem } from '@/utils/ceremonyLogic';
import { pendingCloseoutItems } from '@/utils/closeoutLogic';
import { buildFinalReadinessExceptions, buildFinalReadinessSnapshot } from '@/utils/finalReadinessLogic';

export function WeddingDaySnapshot() {
  const { settings } = useSettings();
  const { runSheetItems } = useRunSheet();
  const { liveIssues } = useLiveIssues();
  const { vendorDayStatuses } = useVendorDayStatuses();
  const { ceremonyItems } = useCeremonyItems();
  const { transportAssignments } = useTransportAssignments();
  const { closeoutItems } = useCloseoutItems();
  const { tasks } = useTasks();
  const { churchRequirements } = useChurchRequirements();
  const { vendors } = useVendors();
  const { guests } = useGuests();
  const { cateringPlans } = useCateringPlans();
  const { dutyAssignments } = useDutyAssignments();
  const { emergencyContacts } = useEmergencyContacts();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();

  const daysLeft = daysUntil(settings.wedding.date);
  const threshold = settings.weddingDay.commandCenterVisibilityDays;
  if (daysLeft === null || daysLeft > threshold) return null;

  const runSheetReady = runSheetItems.filter((i) => i.status !== 'Planned').length;
  const criticalIssuesCount = criticalOpenLiveIssues(liveIssues).length;
  const vendorsCheckedIn = vendorDayStatuses.filter(hasVendorArrived).length;
  const criticalItems = ceremonyItems.filter((i) => i.applicability === 'Applicable' && isCriticalCeremonyItem(i));
  const criticalItemsVerified = criticalItems.filter((i) => i.verificationStatus === 'Verified').length;
  const transportExceptions = transportAssignments.filter((a) => a.assignmentStatus === 'No Show' || a.assignmentStatus === 'Cancelled').length;
  const closeoutPending = pendingCloseoutItems(closeoutItems).length;

  const snapshot = buildFinalReadinessSnapshot({
    tasks,
    churchRequirements,
    ceremonyItems,
    vendors,
    guests,
    cateringPlans,
    roomingListStable: false,
    pickupDropStable: false,
    dutyAssignments,
    runSheetItems,
    emergencyContacts,
    paymentSchedules,
    payments,
    liveIssues,
    weddingDate: settings.wedding.date,
  });
  const readinessExceptions = buildFinalReadinessExceptions(snapshot).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wedding day snapshot</CardTitle>
        <Link to="/wedding-day" className="text-xs font-medium text-brand-700 hover:underline">
          Open Command Center
        </Link>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Final readiness" value={`${snapshot.length - readinessExceptions}/${snapshot.length}`} tone={readinessExceptions === 0 ? 'success' : 'warning'} hint="Checks ready" />
        <StatTile label="Run sheet progress" value={`${runSheetReady}/${runSheetItems.length}`} hint="Items underway or done" />
        <StatTile label="Open critical issues" value={criticalIssuesCount} tone={criticalIssuesCount > 0 ? 'critical' : 'default'} />
        <StatTile label="Vendors checked in" value={`${vendorsCheckedIn}/${vendorDayStatuses.length}`} />
        <StatTile label="Critical items verified" value={`${criticalItemsVerified}/${criticalItems.length}`} tone={criticalItemsVerified === criticalItems.length ? 'success' : 'warning'} />
        <StatTile label="Transport exceptions" value={transportExceptions} tone={transportExceptions > 0 ? 'warning' : 'default'} />
        <StatTile label="Closeout pending" value={closeoutPending} />
      </CardBody>
    </Card>
  );
}
