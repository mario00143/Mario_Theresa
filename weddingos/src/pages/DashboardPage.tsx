import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useVehicles } from '@/hooks/useVehicles';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useVendors } from '@/hooks/useVendors';
import { useContracts } from '@/hooks/useContracts';
import { useBudgetCategories, useBudgetItems } from '@/hooks/useBudget';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useRefunds } from '@/hooks/useRefunds';
import { useSettings } from '@/hooks/useSettings';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useAttireItems } from '@/hooks/useAttireItems';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { usePhotoGroups } from '@/hooks/usePhotoGroups';
import { useMusicCues } from '@/hooks/useMusicCues';
import { useMusicAVPlans } from '@/hooks/useMusicAVPlans';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useWelcomeKits } from '@/hooks/useWelcomeKits';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useVendorDayStatuses } from '@/hooks/useVendorDayStatuses';
import { useGuestOperationalStatuses } from '@/hooks/useGuestOperationalStatuses';
import { EventCards } from '@/features/dashboard/EventCards';
import { PlanningHealthGrid } from '@/features/dashboard/PlanningHealthGrid';
import { AttentionRequired } from '@/features/dashboard/AttentionRequired';
import { UpcomingTasksList } from '@/features/dashboard/UpcomingTasksList';
import { WorkstreamProgress } from '@/features/dashboard/WorkstreamProgress';
import { GuestSnapshot } from '@/features/dashboard/GuestSnapshot';
import { LogisticsSnapshot } from '@/features/dashboard/LogisticsSnapshot';
import { FinanceSnapshot } from '@/features/dashboard/FinanceSnapshot';
import { WeddingPrepSnapshot } from '@/features/dashboard/WeddingPrepSnapshot';
import { WeddingDaySnapshot } from '@/features/dashboard/WeddingDaySnapshot';
import {
  buildAttentionItems,
  buildFinanceAttentionItems,
  buildGuestAttentionItems,
  buildLogisticsAttentionItems,
  buildWeddingDayAttentionItems,
  buildWeddingPrepAttentionItems,
  computePlanningHealth,
  upcomingIncompleteTasks,
} from '@/utils/dashboardStats';
import { detectWeddingPrepIssues } from '@/utils/weddingPrepDataQuality';
import { computeSuggestedCateringCounts } from '@/utils/cateringLogic';
import { computeCommandCenterAlerts } from '@/utils/commandCenterLogic';
import { daysUntil, weddingDateTimeISO } from '@/utils/date';

export function DashboardPage() {
  const { tasks } = useTasks();
  const { decisions } = useDecisions();
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { roomAssignments } = useRoomAssignments();
  const { vehicles } = useVehicles();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();
  const { vendors } = useVendors();
  const { contracts } = useContracts();
  const { budgetCategories } = useBudgetCategories();
  const { budgetItems } = useBudgetItems();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { refunds } = useRefunds();
  const { settings } = useSettings();
  const { churchProfiles } = useChurchProfiles();
  const { churchRequirements } = useChurchRequirements();
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { ceremonyItems } = useCeremonyItems();
  const { cateringPlans } = useCateringPlans();
  const { menuItems } = useMenuItems();
  const { decorPlans } = useDecorPlans();
  const { attireProfiles } = useAttireProfiles();
  const { attireItems } = useAttireItems();
  const { photographyPlans } = usePhotographyPlans();
  const { photoGroups } = usePhotoGroups();
  const { musicCues } = useMusicCues();
  const { musicAVPlans } = useMusicAVPlans();
  const { giftPlans } = useGiftPlans();
  const { welcomeKits } = useWelcomeKits();
  const { runSheetItems } = useRunSheet();
  const { liveIssues } = useLiveIssues();
  const { vendorDayStatuses } = useVendorDayStatuses();
  const { guestOperationalStatuses } = useGuestOperationalStatuses();

  const health = computePlanningHealth(tasks, decisions);
  const daysUntilWedding = daysUntil(settings.wedding.date);
  const suggestedCatering = computeSuggestedCateringCounts(guests, 'Wedding');
  const weddingPrepIssues = detectWeddingPrepIssues({
    churchProfile: churchProfiles[0],
    churchRequirements,
    ceremonyParticipants,
    ceremonyItems,
    cateringPlans,
    menuItems,
    decorPlans,
    attireProfiles,
    attireItems,
    photographyPlans,
    photoGroups,
    musicCues,
    musicAVPlans,
    giftPlans,
    welcomeKits,
    weddingDateTimeISO: weddingDateTimeISO(settings),
    confirmedWeddingAttendance: suggestedCatering.confirmedAttendees,
    favorBuffer: 10,
  });
  const attentionItems = [
    ...buildAttentionItems(tasks, decisions),
    ...buildGuestAttentionItems(households, guests),
    ...buildLogisticsAttentionItems(guests, travelSegments, roomAssignments, vehicles, routes, transportAssignments),
    ...buildFinanceAttentionItems(
      vendors, contracts, budgetCategories, budgetItems, paymentSchedules, payments, refunds,
      settings.finance.criticalVendorCategories, weddingDateTimeISO(settings), 72, settings.finance.budgetVarianceWarningPercent,
    ),
    ...buildWeddingPrepAttentionItems(weddingPrepIssues),
    ...(daysUntilWedding !== null && daysUntilWedding <= settings.weddingDay.commandCenterVisibilityDays
      ? buildWeddingDayAttentionItems(
          computeCommandCenterAlerts({
            runSheetItems,
            ceremonyItems,
            liveIssues,
            transportRoutes: routes,
            transportAssignments,
            vendors,
            vendorDayStatuses,
            guestOperationalStatuses,
            settings,
            referenceDateTimeISO: settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString(),
          }),
        )
      : []),
  ];
  const upcoming = upcomingIncompleteTasks(tasks, 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-faint mt-0.5">Your wedding command center at a glance.</p>
      </div>

      <EventCards />
      <PlanningHealthGrid health={health} />
      <GuestSnapshot />
      <LogisticsSnapshot />
      <FinanceSnapshot />
      <WeddingPrepSnapshot />
      <WeddingDaySnapshot />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AttentionRequired items={attentionItems} />
        <UpcomingTasksList tasks={upcoming} />
      </div>

      <WorkstreamProgress tasks={tasks} />
    </div>
  );
}
