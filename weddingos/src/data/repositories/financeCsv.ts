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
import {
  buildPaymentDueReport,
  buildPaymentHistoryReport,
  buildRefundReport,
  buildVendorReadinessReport,
} from '@/utils/financeReports';

function csvEscape(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function vendorsToCSV(vendors: Vendor[], contacts: VendorContact[]): string {
  const contactById = new Map(contacts.map((c) => [c.id, c]));
  const headers = [
    'Vendor Name', 'Category', 'Status', 'Event', 'Primary Contact', 'Phone', 'Email', 'City',
    'GST Applicable', 'GST Number', 'Booking Owner', 'Last Confirmed At',
    'Final Primary Contact Confirmed', 'Final Backup Contact Confirmed',
  ];
  const rows = vendors.map((vendor) => {
    const primaryContact = vendor.primaryContactId ? contactById.get(vendor.primaryContactId) : undefined;
    return [
      vendor.name,
      vendor.category,
      vendor.status,
      vendor.event,
      primaryContact?.name ?? '',
      primaryContact?.phone ?? vendor.phone ?? '',
      vendor.email ?? '',
      vendor.city ?? '',
      vendor.gstApplicable ? 'Yes' : 'No',
      vendor.gstNumber ?? '',
      vendor.bookingOwner ?? '',
      vendor.lastConfirmedAt ?? '',
      vendor.finalPrimaryContactConfirmed ? 'Yes' : 'No',
      vendor.finalBackupContactConfirmed ? 'Yes' : 'No',
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function vendorQuotesToCSV(quotes: VendorQuote[], vendors: Vendor[]): string {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const headers = [
    'Vendor', 'Quote Reference', 'Quote Date', 'Valid Until', 'Base Amount', 'Discount Amount',
    'Tax Amount', 'Other Charges', 'Total Amount', 'Negotiated Amount', 'Currency', 'Status', 'Selected',
  ];
  const rows = quotes.map((quote) =>
    [
      vendorById.get(quote.vendorId)?.name ?? '',
      quote.quoteReference ?? '',
      quote.quoteDate ?? '',
      quote.validUntil ?? '',
      quote.baseAmount,
      quote.discountAmount,
      quote.taxAmount,
      quote.otherCharges,
      quote.totalAmount,
      quote.negotiatedAmount ?? '',
      quote.currency,
      quote.status,
      quote.isSelected ? 'Yes' : 'No',
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function contractsToCSV(contracts: Contract[], vendors: Vendor[]): string {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const headers = [
    'Vendor', 'Contract Reference', 'Contract Date', 'Status', 'Service Start Date', 'Service End Date',
    'Team Size', 'Refundable Deposit', 'Final Settlement Due Date',
  ];
  const rows = contracts.map((contract) =>
    [
      vendorById.get(contract.vendorId)?.name ?? '',
      contract.contractReference ?? '',
      contract.contractDate ?? '',
      contract.status,
      contract.serviceStartDate ?? '',
      contract.serviceEndDate ?? '',
      contract.teamSize ?? '',
      contract.refundableDeposit ?? '',
      contract.finalSettlementDueDate ?? '',
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function budgetToCSV(categories: BudgetCategory[], items: BudgetItem[], vendors: Vendor[]): string {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const headers = [
    'Category', 'Item Name', 'Vendor', 'Event', 'Original Budget', 'Latest Estimate',
    'Negotiated Amount', 'Committed Amount', 'Actual Amount', 'Approval Status',
  ];
  const rows = items.map((item) =>
    [
      categoryById.get(item.categoryId)?.name ?? '',
      item.itemName,
      item.vendorId ? (vendorById.get(item.vendorId)?.name ?? '') : '',
      item.event,
      item.originalBudget,
      item.latestEstimate ?? '',
      item.negotiatedAmount ?? '',
      item.committedAmount ?? '',
      item.actualAmount ?? '',
      item.approvalStatus,
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function paymentsDueToCSV(schedules: PaymentSchedule[], vendors: Vendor[], payments: Payment[]): string {
  const rows = buildPaymentDueReport(schedules, vendors, payments);
  const headers = ['Vendor', 'Milestone', 'Due Date', 'Amount', 'Paid', 'Outstanding', 'Status'];
  const lines = rows.map((row) =>
    [
      row.vendor?.name ?? '',
      row.schedule.milestone,
      row.schedule.dueDate ?? '',
      row.schedule.amount,
      row.paid,
      row.outstanding,
      row.status,
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export function paymentHistoryToCSV(payments: Payment[], vendors: Vendor[]): string {
  const rows = buildPaymentHistoryReport(payments, vendors);
  const headers = [
    'Date', 'Vendor', 'Amount', 'Method', 'Reference Number', 'Invoice Received', 'Receipt Received', 'Paid By',
  ];
  const lines = rows.map((row) =>
    [
      row.payment.paymentDate,
      row.vendor?.name ?? '',
      row.payment.amount,
      row.payment.paymentMethod,
      row.payment.referenceNumber ?? '',
      row.payment.invoiceReceived ? 'Yes' : 'No',
      row.payment.receiptReceived ? 'Yes' : 'No',
      row.payment.paidBy ?? '',
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export function refundsToCSV(refunds: Refund[], vendors: Vendor[]): string {
  const rows = buildRefundReport(refunds, vendors);
  const headers = [
    'Vendor', 'Refund Type', 'Status', 'Expected Amount', 'Expected Date', 'Received Amount', 'Received Date', 'Outstanding',
  ];
  const lines = rows.map((row) =>
    [
      row.vendor?.name ?? '',
      row.refund.refundType,
      row.refund.status,
      row.refund.expectedAmount ?? '',
      row.refund.expectedDate ?? '',
      row.refund.receivedAmount ?? '',
      row.refund.receivedDate ?? '',
      row.outstanding,
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export function vendorReadinessToCSV(
  vendors: Vendor[],
  contacts: VendorContact[],
  quotes: VendorQuote[],
  contracts: Contract[],
  schedules: PaymentSchedule[],
  payments: Payment[],
): string {
  const rows = buildVendorReadinessReport(vendors, contacts, quotes, contracts, schedules, payments);
  const headers = ['Vendor', 'Category', 'Status', 'Readiness Level', 'Missing Items'];
  const lines = rows.map((row) =>
    [row.vendor.name, row.vendor.category, row.vendor.status, row.readinessLevel, row.missingItems.join('; ')]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

function csvFilename(slug: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-${slug}-${stamp}.csv`;
}

export const vendorsCsvFilename = () => csvFilename('vendors');
export const vendorQuotesCsvFilename = () => csvFilename('vendor-quotes');
export const contractsCsvFilename = () => csvFilename('contracts');
export const budgetCsvFilename = () => csvFilename('budget');
export const paymentsDueCsvFilename = () => csvFilename('payments-due');
export const paymentHistoryCsvFilename = () => csvFilename('payment-history');
export const refundsCsvFilename = () => csvFilename('refunds');
export const vendorReadinessCsvFilename = () => csvFilename('vendor-readiness');
