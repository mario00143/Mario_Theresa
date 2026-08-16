import type {
  CateringPlan,
  CeremonyItem,
  ChurchRequirement,
  DutyAssignment,
  EmergencyContact,
  EmergencyContactCategory,
  FinalReadinessException,
  FinalReadinessSnapshotItem,
  Guest,
  LiveIssue,
  Payment,
  PaymentSchedule,
  RunSheetItem,
  Task,
  Vendor,
} from '@/types';
import { CHURCH_REQUIREMENT_DONE_STATUSES, DEFAULT_CRITICAL_CHURCH_REQUIREMENT_CATEGORIES, DEFAULT_CRITICAL_DUTY_ROLES } from '@/types';
import { criticalCompletionPercentage } from './taskLogic';
import { isCriticalCeremonyItem } from './ceremonyLogic';
import { missingCriticalDutyRoles } from './dutyLogic';
import { computePaymentScheduleStatus } from './paymentLogic';
import { criticalOpenLiveIssues, openLiveIssues } from './liveIssueLogic';
import { todayISO } from './date';

const REQUIRED_EMERGENCY_CATEGORIES: EmergencyContactCategory[] = ['Hospital', 'Ambulance', 'Venue Security', 'Family Emergency'];

export interface FinalReadinessInput {
  tasks: Task[];
  churchRequirements: ChurchRequirement[];
  ceremonyItems: CeremonyItem[];
  vendors: Vendor[];
  guests: Guest[];
  cateringPlans: CateringPlan[];
  roomingListStable: boolean;
  pickupDropStable: boolean;
  dutyAssignments: DutyAssignment[];
  runSheetItems: RunSheetItem[];
  emergencyContacts: EmergencyContact[];
  paymentSchedules: PaymentSchedule[];
  payments: Payment[];
  liveIssues: LiveIssue[];
  weddingDate: string;
  referenceDate?: string;
}

function isChurchRequirementDone(status: ChurchRequirement['status']): boolean {
  return (CHURCH_REQUIREMENT_DONE_STATUSES as readonly string[]).includes(status);
}

/** Section 29: builds the full pre-wedding readiness checklist as a point-in-time snapshot. */
export function buildFinalReadinessSnapshot(input: FinalReadinessInput): FinalReadinessSnapshotItem[] {
  const referenceDate = input.referenceDate ?? todayISO();

  const criticalTaskPercent = criticalCompletionPercentage(input.tasks);

  const criticalChurchReqs = input.churchRequirements.filter(
    (r) => r.applicability === 'Applicable' && DEFAULT_CRITICAL_CHURCH_REQUIREMENT_CATEGORIES.includes(r.category),
  );
  const churchReqsReady = criticalChurchReqs.length === 0 || criticalChurchReqs.every((r) => isChurchRequirementDone(r.status));

  const criticalItems = input.ceremonyItems.filter((i) => i.applicability === 'Applicable' && isCriticalCeremonyItem(i));
  const ceremonyItemsReady = criticalItems.length === 0 || criticalItems.every((i) => i.verificationStatus === 'Verified');

  const vendorsReady = input.vendors.length > 0 && input.vendors.every((v) => v.status === 'Confirmed' || v.status === 'Completed');

  const guestsWithNoResponse = input.guests.filter((g) => g.rsvpResponses.some((r) => r.event === 'Wedding' && (r.status === 'Pending' || r.status === 'No Response')));
  const guestCountFinalized = guestsWithNoResponse.length === 0;

  const cateringFinalized = input.cateringPlans.length > 0 && input.cateringPlans.every((p) => p.guaranteedCount !== undefined);

  const dutyRosterReady = missingCriticalDutyRoles(input.dutyAssignments, DEFAULT_CRITICAL_DUTY_ROLES).length === 0;

  const runSheetOwnersReady = input.runSheetItems.length > 0 && input.runSheetItems.every((i) => Boolean(i.owner));

  const emergencyCategoriesPresent = new Set(input.emergencyContacts.map((c) => c.category));
  const emergencyContactsReady = REQUIRED_EMERGENCY_CATEGORIES.every((c) => emergencyCategoriesPresent.has(c));

  const schedulesDueBeforeWedding = input.paymentSchedules.filter((s) => s.dueDate && s.dueDate <= input.weddingDate);
  const paymentsHandled = schedulesDueBeforeWedding.every((s) => {
    const status = computePaymentScheduleStatus(s, input.payments, referenceDate);
    return status === 'Paid' || status === 'Cancelled';
  });

  const unresolvedRisks = [...criticalOpenLiveIssues(input.liveIssues), ...openLiveIssues(input.liveIssues).filter((i) => i.severity === 'High')];

  return [
    { label: 'Critical tasks complete', ready: criticalTaskPercent === 100, detail: `${criticalTaskPercent}% of critical tasks complete` },
    { label: 'Critical church requirements complete', ready: churchReqsReady, detail: `${criticalChurchReqs.filter((r) => isChurchRequirementDone(r.status)).length}/${criticalChurchReqs.length} complete` },
    { label: 'Critical ceremony items verified', ready: ceremonyItemsReady, detail: `${criticalItems.filter((i) => i.verificationStatus === 'Verified').length}/${criticalItems.length} verified` },
    { label: 'Vendors confirmed', ready: vendorsReady, detail: `${input.vendors.filter((v) => v.status === 'Confirmed' || v.status === 'Completed').length}/${input.vendors.length} confirmed` },
    { label: 'Guest count finalized', ready: guestCountFinalized, detail: `${guestsWithNoResponse.length} guest(s) still pending RSVP` },
    { label: 'Catering guaranteed count finalized', ready: cateringFinalized, detail: cateringFinalized ? 'Guaranteed count set' : 'Guaranteed count missing' },
    { label: 'Rooming list stable', ready: input.roomingListStable, detail: input.roomingListStable ? 'Frozen' : 'Not yet frozen' },
    { label: 'Pickup / drop assignments stable', ready: input.pickupDropStable, detail: input.pickupDropStable ? 'Frozen' : 'Not yet frozen' },
    { label: 'Duty roster assigned', ready: dutyRosterReady, detail: dutyRosterReady ? 'All critical roles assigned' : 'Critical role(s) unassigned' },
    { label: 'Run sheet owners assigned', ready: runSheetOwnersReady, detail: runSheetOwnersReady ? 'All items have an owner' : 'Some run-sheet items have no owner' },
    { label: 'Emergency contacts complete', ready: emergencyContactsReady, detail: emergencyContactsReady ? 'All required categories on file' : 'Missing a required emergency contact category' },
    { label: 'Payments due before wedding handled', ready: paymentsHandled, detail: `${schedulesDueBeforeWedding.filter((s) => computePaymentScheduleStatus(s, input.payments, referenceDate) === 'Paid').length}/${schedulesDueBeforeWedding.length} paid` },
    { label: 'High/critical risks unresolved', ready: unresolvedRisks.length === 0, detail: `${unresolvedRisks.length} unresolved high/critical issue(s)` },
  ];
}

export function buildFinalReadinessExceptions(snapshot: FinalReadinessSnapshotItem[]): FinalReadinessException[] {
  return snapshot.filter((item) => !item.ready).map((item) => ({ label: item.label, detail: item.detail }));
}
