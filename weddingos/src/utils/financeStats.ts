import type { BudgetItem, Contract, Payment, PaymentSchedule, Refund, Vendor, VendorQuote } from '@/types';
import { computeBudgetTotals } from './budgetLogic';
import { computePaymentScheduleStatus, totalPaidForVendor } from './paymentLogic';
import { isQuoteExpiringSoon } from './quoteLogic';
import { isCriticalVendorNotReconfirmed } from './vendorReadiness';
import { todayISO } from './date';

export interface VendorOverviewStats {
  researching: number;
  shortlisted: number;
  quoted: number;
  negotiating: number;
  selected: number;
  contracted: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  contractsMissing: number;
  quotesExpiringSoon: number;
  vendorsRequiringReconfirmation: number;
  vendorsWithOverduePayment: number;
  vendorsWithOutstandingRefunds: number;
}

const VENDOR_STATUSES_EXPECTING_CONTRACT: Vendor['status'][] = ['Selected', 'Contracted', 'Confirmed', 'Completed'];

export function computeVendorOverview(
  vendors: Vendor[],
  vendorQuotes: VendorQuote[],
  contracts: Contract[],
  paymentSchedules: PaymentSchedule[],
  payments: Payment[],
  refunds: Refund[],
  criticalVendorCategories: string[],
  weddingDateTimeISO: string,
  reconfirmationHoursThreshold: number,
  referenceDateTimeISO: string = new Date().toISOString(),
): VendorOverviewStats {
  const referenceDate = todayISO(new Date(referenceDateTimeISO));
  const contractsByVendor = new Map<string, Contract[]>();
  for (const contract of contracts) {
    const list = contractsByVendor.get(contract.vendorId) ?? [];
    list.push(contract);
    contractsByVendor.set(contract.vendorId, list);
  }

  const contractsMissing = vendors.filter(
    (v) => VENDOR_STATUSES_EXPECTING_CONTRACT.includes(v.status) && (contractsByVendor.get(v.id) ?? []).length === 0,
  ).length;

  const vendorsRequiringReconfirmation = vendors.filter((v) =>
    isCriticalVendorNotReconfirmed(v, criticalVendorCategories, weddingDateTimeISO, reconfirmationHoursThreshold, referenceDateTimeISO),
  ).length;

  const vendorsWithOverduePayment = vendors.filter((v) =>
    paymentSchedules.some((s) => s.vendorId === v.id && computePaymentScheduleStatus(s, payments, referenceDate) === 'Overdue'),
  ).length;

  const vendorsWithOutstandingRefunds = vendors.filter((v) =>
    refunds.some((r) => r.vendorId === v.id && (r.status === 'Expected' || r.status === 'Partially Received')),
  ).length;

  return {
    researching: vendors.filter((v) => v.status === 'Researching').length,
    shortlisted: vendors.filter((v) => v.status === 'Shortlisted').length,
    quoted: vendors.filter((v) => v.status === 'Quoted').length,
    negotiating: vendors.filter((v) => v.status === 'Negotiating').length,
    selected: vendors.filter((v) => v.status === 'Selected').length,
    contracted: vendors.filter((v) => v.status === 'Contracted').length,
    confirmed: vendors.filter((v) => v.status === 'Confirmed').length,
    completed: vendors.filter((v) => v.status === 'Completed').length,
    cancelled: vendors.filter((v) => v.status === 'Cancelled').length,
    contractsMissing,
    quotesExpiringSoon: vendorQuotes.filter((q) => isQuoteExpiringSoon(q, 7, new Date(referenceDateTimeISO))).length,
    vendorsRequiringReconfirmation,
    vendorsWithOverduePayment,
    vendorsWithOutstandingRefunds,
  };
}

export interface FinanceSnapshotStats {
  originalBudget: number;
  latestForecast: number;
  committed: number;
  paid: number;
  outstanding: number;
  variance: number;
}

/** Section 27's compact dashboard Finance Snapshot. */
export function computeFinanceSnapshot(budgetItems: BudgetItem[], payments: Payment[]): FinanceSnapshotStats {
  const totals = computeBudgetTotals(budgetItems);
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    originalBudget: totals.originalBudget,
    latestForecast: totals.latestForecast,
    committed: totals.committed,
    paid,
    outstanding: Math.max(0, totals.committed - paid),
    variance: totals.variance,
  };
}

export function vendorCommittedAmount(vendorId: string, budgetItems: BudgetItem[]): number {
  return budgetItems.filter((i) => i.vendorId === vendorId).reduce((sum, i) => sum + (i.committedAmount ?? 0), 0);
}

export function vendorPaidAmount(vendorId: string, payments: Payment[]): number {
  return totalPaidForVendor(payments, vendorId);
}
