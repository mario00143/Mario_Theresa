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
import { EventCards } from '@/features/dashboard/EventCards';
import { PlanningHealthGrid } from '@/features/dashboard/PlanningHealthGrid';
import { AttentionRequired } from '@/features/dashboard/AttentionRequired';
import { UpcomingTasksList } from '@/features/dashboard/UpcomingTasksList';
import { WorkstreamProgress } from '@/features/dashboard/WorkstreamProgress';
import { GuestSnapshot } from '@/features/dashboard/GuestSnapshot';
import { LogisticsSnapshot } from '@/features/dashboard/LogisticsSnapshot';
import { FinanceSnapshot } from '@/features/dashboard/FinanceSnapshot';
import {
  buildAttentionItems,
  buildFinanceAttentionItems,
  buildGuestAttentionItems,
  buildLogisticsAttentionItems,
  computePlanningHealth,
  upcomingIncompleteTasks,
} from '@/utils/dashboardStats';
import { weddingDateTimeISO } from '@/utils/date';

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

  const health = computePlanningHealth(tasks, decisions);
  const attentionItems = [
    ...buildAttentionItems(tasks, decisions),
    ...buildGuestAttentionItems(households, guests),
    ...buildLogisticsAttentionItems(guests, travelSegments, roomAssignments, vehicles, routes, transportAssignments),
    ...buildFinanceAttentionItems(
      vendors, contracts, budgetCategories, budgetItems, paymentSchedules, payments, refunds,
      settings.finance.criticalVendorCategories, weddingDateTimeISO(settings), 72, settings.finance.budgetVarianceWarningPercent,
    ),
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AttentionRequired items={attentionItems} />
        <UpcomingTasksList tasks={upcoming} />
      </div>

      <WorkstreamProgress tasks={tasks} />
    </div>
  );
}
