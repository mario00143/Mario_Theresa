import type {
  BudgetCategory,
  BudgetItem,
  Contract,
  Payment,
  PaymentSchedule,
  Refund,
  Vendor,
  VendorQuote,
} from '@/types';
import { computeCategorySummary } from './budgetLogic';
import { computePaymentScheduleStatus, totalPaidForVendor } from './paymentLogic';
import { computeVendorReconciliation, hasUndocumentedScheduleMismatch } from './reconciliation';
import { isQuoteExpired } from './quoteLogic';
import { isCriticalVendorNotReconfirmed } from './vendorReadiness';
import { todayISO } from './date';

export type FinancialIssueCategory =
  | 'selected-vendor-no-budget-item'
  | 'selected-vendor-no-selected-quote'
  | 'confirmed-vendor-no-signed-contract'
  | 'contract-no-payment-schedule'
  | 'payment-overdue'
  | 'payment-exceeds-commitment'
  | 'schedule-differs-from-commitment'
  | 'invoice-missing-completed-vendor'
  | 'receipt-missing-completed-vendor'
  | 'refund-overdue'
  | 'budget-category-over-plan'
  | 'committed-without-approval'
  | 'paid-against-rejected-item'
  | 'completed-vendor-outstanding-balance'
  | 'contract-final-settlement-missing'
  | 'critical-vendor-not-reconfirmed'
  | 'quote-expired-still-selected';

export interface FinancialIssue {
  id: string;
  category: FinancialIssueCategory;
  message: string;
  linkType: 'vendor' | 'budgetItem' | 'contract' | 'paymentSchedule' | 'refund';
  linkId: string;
}

export interface FinancialDataInput {
  vendors: Vendor[];
  vendorQuotes: VendorQuote[];
  contracts: Contract[];
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  paymentSchedules: PaymentSchedule[];
  payments: Payment[];
  refunds: Refund[];
  weddingDateTimeISO: string;
  criticalVendorCategories: string[];
  budgetVarianceWarningPercent: number;
  reconfirmationHoursThreshold: number;
  referenceDateTimeISO?: string;
}

const VENDOR_STATUSES_EXPECTING_BUDGET_ITEM: Vendor['status'][] = ['Selected', 'Contracted', 'Confirmed', 'Completed'];
const VENDOR_STATUSES_EXPECTING_QUOTE: Vendor['status'][] = ['Selected', 'Contracted', 'Confirmed', 'Completed'];

export function detectFinancialIssues(input: FinancialDataInput): FinancialIssue[] {
  const {
    vendors,
    vendorQuotes,
    contracts,
    budgetCategories,
    budgetItems,
    paymentSchedules,
    payments,
    refunds,
    weddingDateTimeISO,
    criticalVendorCategories,
    budgetVarianceWarningPercent,
    reconfirmationHoursThreshold,
  } = input;
  const referenceDateTimeISO = input.referenceDateTimeISO ?? new Date().toISOString();
  const referenceDate = todayISO(new Date(referenceDateTimeISO));
  const issues: FinancialIssue[] = [];

  for (const vendor of vendors) {
    const vendorQuotesForVendor = vendorQuotes.filter((q) => q.vendorId === vendor.id);
    const vendorContracts = contracts.filter((c) => c.vendorId === vendor.id);
    const vendorBudgetItems = budgetItems.filter((i) => i.vendorId === vendor.id);
    const vendorSchedules = paymentSchedules.filter((s) => s.vendorId === vendor.id);
    const vendorPayments = payments.filter((p) => p.vendorId === vendor.id);
    const committed = vendorBudgetItems.reduce((sum, i) => sum + (i.committedAmount ?? 0), 0);

    // 1. Selected vendor with no budget item.
    if (VENDOR_STATUSES_EXPECTING_BUDGET_ITEM.includes(vendor.status) && vendorBudgetItems.length === 0) {
      issues.push({
        id: `no-budget-item-${vendor.id}`,
        category: 'selected-vendor-no-budget-item',
        message: `"${vendor.name}" is ${vendor.status} but has no budget item linked.`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }

    // 2. Selected vendor with no selected quote.
    if (VENDOR_STATUSES_EXPECTING_QUOTE.includes(vendor.status) && !vendorQuotesForVendor.some((q) => q.isSelected)) {
      issues.push({
        id: `no-selected-quote-${vendor.id}`,
        category: 'selected-vendor-no-selected-quote',
        message: `"${vendor.name}" is ${vendor.status} but has no selected quote.`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }

    // 3. Confirmed vendor without signed contract.
    if (vendor.status === 'Confirmed' && !vendorContracts.some((c) => c.status === 'Signed' || c.status === 'Active' || c.status === 'Completed')) {
      issues.push({
        id: `confirmed-no-contract-${vendor.id}`,
        category: 'confirmed-vendor-no-signed-contract',
        message: `"${vendor.name}" is Confirmed but has no signed contract.`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }

    // 8, 9. Invoice/receipt missing for a completed vendor's payments.
    if (vendor.status === 'Completed') {
      for (const payment of vendorPayments) {
        if (!payment.invoiceReceived) {
          issues.push({
            id: `invoice-missing-${payment.id}`,
            category: 'invoice-missing-completed-vendor',
            message: `Invoice missing for a payment to "${vendor.name}" (completed vendor).`,
            linkType: 'vendor',
            linkId: vendor.id,
          });
        }
        if (!payment.receiptReceived) {
          issues.push({
            id: `receipt-missing-${payment.id}`,
            category: 'receipt-missing-completed-vendor',
            message: `Receipt missing for a payment to "${vendor.name}" (completed vendor).`,
            linkType: 'vendor',
            linkId: vendor.id,
          });
        }
      }
    }

    // 14. Vendor marked Completed with outstanding balance.
    if (vendor.status === 'Completed') {
      const reconciliation = computeVendorReconciliation(vendor.id, committed, paymentSchedules, payments, refunds);
      if (reconciliation.outstanding > 0) {
        issues.push({
          id: `completed-outstanding-${vendor.id}`,
          category: 'completed-vendor-outstanding-balance',
          message: `"${vendor.name}" is marked Completed but still has an outstanding balance.`,
          linkType: 'vendor',
          linkId: vendor.id,
        });
      }
    }

    // 16. Critical vendor not reconfirmed within the threshold window.
    if (isCriticalVendorNotReconfirmed(vendor, criticalVendorCategories, weddingDateTimeISO, reconfirmationHoursThreshold, referenceDateTimeISO)) {
      issues.push({
        id: `not-reconfirmed-${vendor.id}`,
        category: 'critical-vendor-not-reconfirmed',
        message: `"${vendor.name}" is a critical vendor and has not been reconfirmed within ${reconfirmationHoursThreshold} hours of the wedding.`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }

    // 7. Scheduled total differs from commitment (undocumented).
    if (vendorSchedules.length > 0 && hasUndocumentedScheduleMismatch(vendor.id, committed, paymentSchedules)) {
      issues.push({
        id: `schedule-mismatch-${vendor.id}`,
        category: 'schedule-differs-from-commitment',
        message: `"${vendor.name}"'s scheduled payment total differs from its committed amount by more than ₹1, with no note explaining it.`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }

    // 6. Payment exceeds commitment.
    if (committed > 0) {
      const paid = totalPaidForVendor(payments, vendor.id);
      if (paid > committed) {
        issues.push({
          id: `payment-exceeds-commitment-${vendor.id}`,
          category: 'payment-exceeds-commitment',
          message: `Total payments to "${vendor.name}" (₹${paid.toLocaleString('en-IN')}) exceed its committed amount (₹${committed.toLocaleString('en-IN')}).`,
          linkType: 'vendor',
          linkId: vendor.id,
        });
      }
    }
  }

  // 4. Contract with no payment schedule.
  for (const contract of contracts) {
    if (contract.status === 'Cancelled') continue;
    const hasSchedule = paymentSchedules.some((s) => s.contractId === contract.id || s.vendorId === contract.vendorId);
    if (!hasSchedule) {
      issues.push({
        id: `contract-no-schedule-${contract.id}`,
        category: 'contract-no-payment-schedule',
        message: `Contract ${contract.contractReference ?? contract.id} has no payment schedule.`,
        linkType: 'contract',
        linkId: contract.id,
      });
    }

    // 15. Contract final settlement date missing.
    if (!contract.finalSettlementDueDate) {
      issues.push({
        id: `contract-no-settlement-date-${contract.id}`,
        category: 'contract-final-settlement-missing',
        message: `Contract ${contract.contractReference ?? contract.id} has no final settlement date.`,
        linkType: 'contract',
        linkId: contract.id,
      });
    }
  }

  // 5. Payment (schedule) overdue.
  for (const schedule of paymentSchedules) {
    if (computePaymentScheduleStatus(schedule, payments, referenceDate) === 'Overdue') {
      issues.push({
        id: `schedule-overdue-${schedule.id}`,
        category: 'payment-overdue',
        message: `Payment "${schedule.milestone}" is overdue.`,
        linkType: 'paymentSchedule',
        linkId: schedule.id,
      });
    }
  }

  // 10. Refund overdue.
  for (const refund of refunds) {
    if ((refund.status === 'Expected' || refund.status === 'Partially Received') && refund.expectedDate && refund.expectedDate < referenceDate) {
      issues.push({
        id: `refund-overdue-${refund.id}`,
        category: 'refund-overdue',
        message: `${refund.refundType} refund is overdue.`,
        linkType: 'refund',
        linkId: refund.id,
      });
    }
  }

  // 11. Budget category over plan threshold.
  for (const category of budgetCategories) {
    const summary = computeCategorySummary(category, budgetItems, budgetVarianceWarningPercent);
    if (summary.isOverThreshold) {
      issues.push({
        id: `category-over-plan-${category.id}`,
        category: 'budget-category-over-plan',
        message: `"${category.name}" is more than ${budgetVarianceWarningPercent}% over its planned budget.`,
        linkType: 'budgetItem',
        linkId: category.id,
      });
    }
  }

  // 12, 13. Committed without approval; paid against a rejected item.
  for (const item of budgetItems) {
    if ((item.committedAmount ?? 0) > 0 && item.approvalStatus !== 'Approved') {
      issues.push({
        id: `committed-no-approval-${item.id}`,
        category: 'committed-without-approval',
        message: `"${item.itemName}" has a committed amount but is not Approved.`,
        linkType: 'budgetItem',
        linkId: item.id,
      });
    }
    if (item.approvalStatus === 'Rejected') {
      const paidAgainstItem = payments.filter((p) => p.budgetItemId === item.id).reduce((sum, p) => sum + p.amount, 0);
      if (paidAgainstItem > 0) {
        issues.push({
          id: `paid-against-rejected-${item.id}`,
          category: 'paid-against-rejected-item',
          message: `"${item.itemName}" has payments recorded against it despite being Rejected.`,
          linkType: 'budgetItem',
          linkId: item.id,
        });
      }
    }
  }

  // 17. Quote expired but still selected.
  for (const quote of vendorQuotes) {
    if (quote.isSelected && isQuoteExpired(quote, new Date(referenceDateTimeISO))) {
      issues.push({
        id: `quote-expired-selected-${quote.id}`,
        category: 'quote-expired-still-selected',
        message: `A selected quote (${quote.quoteReference ?? quote.id}) has expired.`,
        linkType: 'vendor',
        linkId: quote.vendorId,
      });
    }
  }

  return issues;
}
