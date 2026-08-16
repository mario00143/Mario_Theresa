import type {
  BudgetCategory,
  BudgetItem,
  Contract,
  Payment,
  PaymentSchedule,
  Refund,
  Vendor,
  VendorContact,
  VendorQuote,
} from '@/types';
import { computeCategorySummary, computeItemForecast } from './budgetLogic';
import { computePaymentScheduleStatus, scheduleBalance, totalPaidForSchedule } from './paymentLogic';
import { computeVendorReadiness, type ReadinessLevel } from './vendorReadiness';
import { vendorCommittedAmount, vendorPaidAmount } from './financeStats';

export interface BudgetVsForecastRow {
  category: BudgetCategory;
  originalBudget: number;
  latestForecast: number;
  variance: number;
  variancePercent: number;
}

export function buildBudgetVsForecastReport(categories: BudgetCategory[], items: BudgetItem[], varianceWarningPercent: number): BudgetVsForecastRow[] {
  return categories.map((category) => {
    const summary = computeCategorySummary(category, items, varianceWarningPercent);
    return {
      category,
      originalBudget: summary.originalBudget,
      latestForecast: summary.latestForecast,
      variance: summary.variance,
      variancePercent: summary.variancePercent,
    };
  });
}

export interface BudgetVsActualRow {
  category: BudgetCategory;
  budget: number;
  actual: number;
  remaining: number;
}

export function buildBudgetVsActualReport(categories: BudgetCategory[], items: BudgetItem[]): BudgetVsActualRow[] {
  return categories.map((category) => {
    const categoryItems = items.filter((i) => i.categoryId === category.id);
    const budget = category.plannedAmount;
    const actual = categoryItems.reduce((sum, i) => sum + (i.actualAmount ?? 0), 0);
    return { category, budget, actual, remaining: budget - actual };
  });
}

export interface VendorCommitmentRow {
  vendor: Vendor;
  categoryLabel: string;
  selectedQuote: VendorQuote | undefined;
  committed: number;
  paid: number;
  outstanding: number;
}

export function buildVendorCommitmentReport(vendors: Vendor[], vendorQuotes: VendorQuote[], budgetItems: BudgetItem[], payments: Payment[]): VendorCommitmentRow[] {
  return vendors.map((vendor) => {
    const committed = vendorCommittedAmount(vendor.id, budgetItems);
    const paid = vendorPaidAmount(vendor.id, payments);
    return {
      vendor,
      categoryLabel: vendor.category,
      selectedQuote: vendorQuotes.find((q) => q.vendorId === vendor.id && q.isSelected),
      committed,
      paid,
      outstanding: Math.max(0, committed - paid),
    };
  });
}

export interface PaymentDueRow {
  schedule: PaymentSchedule;
  vendor: Vendor | undefined;
  paid: number;
  outstanding: number;
  status: PaymentSchedule['status'];
}

export function buildPaymentDueReport(paymentSchedules: PaymentSchedule[], vendors: Vendor[], payments: Payment[]): PaymentDueRow[] {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  return paymentSchedules.map((schedule) => ({
    schedule,
    vendor: vendorById.get(schedule.vendorId),
    paid: totalPaidForSchedule(payments, schedule.id),
    outstanding: scheduleBalance(schedule, payments),
    status: computePaymentScheduleStatus(schedule, payments),
  }));
}

export interface PaymentHistoryRow {
  payment: Payment;
  vendor: Vendor | undefined;
}

export function buildPaymentHistoryReport(payments: Payment[], vendors: Vendor[]): PaymentHistoryRow[] {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  return [...payments]
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
    .map((payment) => ({ payment, vendor: vendorById.get(payment.vendorId) }));
}

export interface RefundReportRow {
  refund: Refund;
  vendor: Vendor | undefined;
  outstanding: number;
}

export function buildRefundReport(refunds: Refund[], vendors: Vendor[]): RefundReportRow[] {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  return refunds.map((refund) => ({
    refund,
    vendor: vendorById.get(refund.vendorId),
    outstanding: Math.max(0, (refund.expectedAmount ?? 0) - (refund.receivedAmount ?? 0)),
  }));
}

export interface UnapprovedCommitmentRow {
  item: BudgetItem;
  vendor: Vendor | undefined;
}

export function buildUnapprovedCommitmentsReport(budgetItems: BudgetItem[], vendors: Vendor[]): UnapprovedCommitmentRow[] {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  return budgetItems
    .filter((i) => (i.committedAmount ?? 0) > 0 && i.approvalStatus !== 'Approved')
    .map((item) => ({ item, vendor: item.vendorId ? vendorById.get(item.vendorId) : undefined }));
}

export interface VendorReadinessRow {
  vendor: Vendor;
  readinessLevel: ReadinessLevel;
  missingItems: string[];
}

export function buildVendorReadinessReport(
  vendors: Vendor[],
  contacts: VendorContact[],
  vendorQuotes: VendorQuote[],
  contracts: Contract[],
  paymentSchedules: PaymentSchedule[],
  payments: Payment[],
): VendorReadinessRow[] {
  return vendors
    .filter((v) => v.status === 'Selected' || v.status === 'Contracted' || v.status === 'Confirmed')
    .map((vendor) => {
      const readiness = computeVendorReadiness(vendor, contacts, vendorQuotes, contracts, paymentSchedules, payments);
      return { vendor, readinessLevel: readiness.level, missingItems: readiness.reasons };
    });
}

// Re-exported for convenience so report panels don't need a second import for per-item forecast.
export { computeItemForecast };
