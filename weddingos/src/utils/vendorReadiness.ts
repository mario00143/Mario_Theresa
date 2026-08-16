import type { Contract, Payment, PaymentSchedule, Vendor, VendorContact, VendorQuote } from '@/types';
import { computePaymentScheduleStatus } from './paymentLogic';
import { todayISO } from './date';

export const READINESS_LEVELS = ['Not Ready', 'At Risk', 'Mostly Ready', 'Ready'] as const;
export type ReadinessLevel = (typeof READINESS_LEVELS)[number];

export interface ReadinessCheck {
  label: string;
  passed: boolean;
}

export interface VendorReadiness {
  level: ReadinessLevel;
  checks: ReadinessCheck[];
  reasons: string[];
}

/**
 * Section 20: a calculated readiness status for a selected/confirmed
 * vendor, expressed as pass/fail checks with reasons — never a bare score,
 * and never conveyed by color alone (callers must also render the reasons).
 */
export function computeVendorReadiness(
  vendor: Vendor,
  contacts: VendorContact[],
  quotes: VendorQuote[],
  contracts: Contract[],
  paymentSchedules: PaymentSchedule[],
  payments: Payment[],
  referenceDate: string = todayISO(),
): VendorReadiness {
  const vendorContacts = contacts.filter((c) => c.vendorId === vendor.id);
  const vendorQuotes = quotes.filter((q) => q.vendorId === vendor.id);
  const vendorContracts = contracts.filter((c) => c.vendorId === vendor.id);
  const selectedQuote = vendorQuotes.find((q) => q.isSelected);
  const contract = vendorContracts.find((c) => c.status === 'Signed' || c.status === 'Active') ?? vendorContracts[0];
  const vendorSchedules = paymentSchedules.filter((s) => s.vendorId === vendor.id);

  const hasTeamOnSite = (contract?.teamSize ?? 0) > 0;
  const overdueSchedule = vendorSchedules.some((s) => computePaymentScheduleStatus(s, payments, referenceDate) === 'Overdue');

  const checks: ReadinessCheck[] = [
    { label: 'Primary contact exists', passed: Boolean(vendor.primaryContactId && vendorContacts.some((c) => c.id === vendor.primaryContactId)) },
    { label: 'Quote selected', passed: Boolean(selectedQuote) },
    { label: 'Contract signed', passed: Boolean(vendorContracts.some((c) => c.status === 'Signed' || c.status === 'Active' || c.status === 'Completed')) },
    { label: 'Scope documented', passed: Boolean(contract?.scopeIncluded?.trim()) },
    { label: 'Service date/time set', passed: Boolean(contract?.serviceStartDate && contract?.serviceStartTime) },
    { label: 'Payment schedule exists', passed: vendorSchedules.length > 0 },
    { label: 'Advance paid if due', passed: !overdueSchedule },
    { label: 'Venue access requirement documented', passed: Boolean(contract?.venueAccessRequirements?.trim()) },
    { label: 'Team size known', passed: Boolean(contract?.teamSize && contract.teamSize > 0) },
    { label: 'Vendor meal count known if applicable', passed: !hasTeamOnSite || Boolean(contract?.vendorMealCount) },
    { label: 'Final confirmation completed', passed: Boolean(vendor.lastConfirmedAt) },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const ratio = passedCount / checks.length;

  let level: ReadinessLevel;
  if (ratio === 1) level = 'Ready';
  else if (ratio >= 0.75) level = 'Mostly Ready';
  else if (ratio >= 0.4) level = 'At Risk';
  else level = 'Not Ready';

  return {
    level,
    checks,
    reasons: checks.filter((c) => !c.passed).map((c) => c.label),
  };
}

/** Section 21: critical vendors need reconfirmation within N hours of the wedding. */
export function isCriticalVendorNotReconfirmed(
  vendor: Vendor,
  criticalCategories: string[],
  weddingDateTimeISO: string,
  hoursThreshold: number,
  referenceDateTimeISO: string,
): boolean {
  if (!criticalCategories.includes(vendor.category)) return false;
  if (vendor.status === 'Cancelled' || vendor.status === 'Completed') return false;

  const wedding = new Date(weddingDateTimeISO).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (Number.isNaN(wedding) || Number.isNaN(now)) return false;

  const hoursUntilWedding = (wedding - now) / (1000 * 60 * 60);
  if (hoursUntilWedding > hoursThreshold || hoursUntilWedding < -24) return false; // only relevant in the run-up, not long after

  if (!vendor.lastConfirmedAt) return true;
  const confirmed = new Date(vendor.lastConfirmedAt).getTime();
  if (Number.isNaN(confirmed)) return true;
  const hoursSinceConfirmed = (now - confirmed) / (1000 * 60 * 60);
  return hoursSinceConfirmed > hoursThreshold;
}
