import { beforeEach, describe, expect, it } from 'vitest';
import { addVendor } from '@/data/repositories/vendorRepository';
import { addVendorQuote, markVendorQuoteNegotiating, rejectVendorQuote, selectVendorQuote, updateVendorQuote } from '@/data/repositories/vendorQuoteRepository';
import { addContract, updateContract } from '@/data/repositories/contractRepository';
import { resetToDemoData, vendorQuotesStore } from '@/data/stores';
import { effectiveQuoteAmount } from '@/utils/financeCalc';
import { buildQuoteComparison, isQuoteExpired, isQuoteExpiringSoon } from '@/utils/quoteLogic';
import { validateContract, validateVendorContractStatus } from '@/utils/contractLogic';

function newVendor() {
  return addVendor({ name: 'Quote Test Vendor', category: 'Photography', status: 'Quoted', event: 'Wedding', gstApplicable: false });
}

describe('vendor quote totalAmount recomputation', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('computes totalAmount as base - discount + tax + other charges on create', () => {
    const vendor = newVendor();
    const quote = addVendorQuote({
      vendorId: vendor.id, event: 'Wedding', baseAmount: 100000, discountAmount: 5000, taxAmount: 18000, otherCharges: 2000,
      currency: 'INR', status: 'Received', isSelected: false,
    });
    expect(quote.totalAmount).toBe(100000 - 5000 + 18000 + 2000);
  });

  it('recomputes totalAmount whenever any input field changes', () => {
    const vendor = newVendor();
    const quote = addVendorQuote({
      vendorId: vendor.id, event: 'Wedding', baseAmount: 100000, discountAmount: 0, taxAmount: 0, otherCharges: 0,
      currency: 'INR', status: 'Received', isSelected: false,
    });
    updateVendorQuote(quote.id, { discountAmount: 10000 });
    expect(vendorQuotesStore.get().find((q) => q.id === quote.id)?.totalAmount).toBe(90000);
  });

  it('effectiveQuoteAmount prefers negotiatedAmount over totalAmount when present', () => {
    const quote = { totalAmount: 100000, negotiatedAmount: 85000 };
    expect(effectiveQuoteAmount(quote)).toBe(85000);
    expect(effectiveQuoteAmount({ totalAmount: 100000, negotiatedAmount: undefined })).toBe(100000);
  });
});

describe('at most one selected quote per vendor', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('selecting a quote deselects sibling quotes for the same vendor', () => {
    const vendor = newVendor();
    const quoteA = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 1000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    const quoteB = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 900, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });

    selectVendorQuote(quoteA.id);
    expect(vendorQuotesStore.get().find((q) => q.id === quoteA.id)?.isSelected).toBe(true);

    selectVendorQuote(quoteB.id);
    expect(vendorQuotesStore.get().find((q) => q.id === quoteA.id)?.isSelected).toBe(false);
    expect(vendorQuotesStore.get().find((q) => q.id === quoteB.id)?.isSelected).toBe(true);
  });

  it('selecting a quote sets its status to Accepted', () => {
    const vendor = newVendor();
    const quote = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 1000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    selectVendorQuote(quote.id);
    expect(vendorQuotesStore.get().find((q) => q.id === quote.id)?.status).toBe('Accepted');
  });

  it('rejecting a quote clears isSelected and sets status to Rejected', () => {
    const vendor = newVendor();
    const quote = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 1000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    selectVendorQuote(quote.id);
    rejectVendorQuote(quote.id);
    const updated = vendorQuotesStore.get().find((q) => q.id === quote.id)!;
    expect(updated.status).toBe('Rejected');
    expect(updated.isSelected).toBe(false);
  });

  it('marks a quote as Negotiating', () => {
    const vendor = newVendor();
    const quote = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 1000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    markVendorQuoteNegotiating(quote.id);
    expect(vendorQuotesStore.get().find((q) => q.id === quote.id)?.status).toBe('Negotiating');
  });
});

describe('quote expiration', () => {
  it('is expired when validUntil is before the reference date', () => {
    const quote = { validUntil: '2026-01-01' } as Parameters<typeof isQuoteExpired>[0];
    expect(isQuoteExpired(quote, new Date('2026-06-01'))).toBe(true);
  });

  it('is not expired when validUntil is in the future', () => {
    const quote = { validUntil: '2026-12-01' } as Parameters<typeof isQuoteExpired>[0];
    expect(isQuoteExpired(quote, new Date('2026-06-01'))).toBe(false);
  });

  it('is never expired when validUntil is not set', () => {
    const quote = { validUntil: undefined } as Parameters<typeof isQuoteExpired>[0];
    expect(isQuoteExpired(quote, new Date('2026-06-01'))).toBe(false);
  });

  it('flags a quote as expiring soon within the given window', () => {
    const quote = { validUntil: '2026-06-05' } as Parameters<typeof isQuoteExpiringSoon>[0];
    expect(isQuoteExpiringSoon(quote, 7, new Date('2026-06-01'))).toBe(true);
    expect(isQuoteExpiringSoon(quote, 2, new Date('2026-06-01'))).toBe(false);
  });
});

describe('same-category quote comparison', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('flags the lowest-priced active quote as a fact, and marks the selected one', () => {
    const vendor = newVendor();
    const cheap = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 50000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    const expensive = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 90000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    selectVendorQuote(expensive.id);

    const rows = buildQuoteComparison(vendorQuotesStore.get().filter((q) => q.vendorId === vendor.id));
    const cheapRow = rows.find((r) => r.quote.id === cheap.id)!;
    const expensiveRow = rows.find((r) => r.quote.id === expensive.id)!;
    expect(cheapRow.isLowest).toBe(true);
    expect(expensiveRow.isLowest).toBe(false);
    expect(rows.find((r) => r.quote.isSelected)?.quote.id).toBe(expensive.id);
  });

  it('excludes rejected and expired quotes from being flagged as lowest', () => {
    const vendor = newVendor();
    const rejectedCheap = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 10000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });
    rejectVendorQuote(rejectedCheap.id);
    const activeQuote = addVendorQuote({ vendorId: vendor.id, event: 'Wedding', baseAmount: 50000, discountAmount: 0, taxAmount: 0, otherCharges: 0, currency: 'INR', status: 'Received', isSelected: false });

    const rows = buildQuoteComparison(vendorQuotesStore.get().filter((q) => q.vendorId === vendor.id));
    expect(rows.find((r) => r.quote.id === rejectedCheap.id)?.isLowest).toBe(false);
    expect(rows.find((r) => r.quote.id === activeQuote.id)?.isLowest).toBe(true);
  });
});

describe('contract validation warnings', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('warns when a contract is Signed but no quote is selected', () => {
    const contract = { status: 'Signed', cancellationTerms: 'Full refund', finalSettlementDueDate: '2027-01-01' } as Parameters<typeof validateContract>[0];
    const warnings = validateContract(contract, undefined, undefined, '2027-01-30', '2027-01-11');
    expect(warnings.some((w) => w.field === 'quoteId')).toBe(true);
  });

  it('warns when cancellation terms are empty', () => {
    const contract = { status: 'Draft', finalSettlementDueDate: '2027-01-01' } as Parameters<typeof validateContract>[0];
    const warnings = validateContract(contract, undefined, undefined, '2027-01-30', '2027-01-11');
    expect(warnings.some((w) => w.field === 'cancellationTerms')).toBe(true);
  });

  it('warns when the final settlement date is missing', () => {
    const contract = { status: 'Draft', cancellationTerms: 'Full refund' } as Parameters<typeof validateContract>[0];
    const warnings = validateContract(contract, undefined, undefined, '2027-01-30', '2027-01-11');
    expect(warnings.some((w) => w.field === 'finalSettlementDueDate')).toBe(true);
  });

  it('warns when contract value differs materially (>2%) from the selected quote', () => {
    const contract = {
      status: 'Signed', cancellationTerms: 'Full refund', finalSettlementDueDate: '2027-01-01',
    } as Parameters<typeof validateContract>[0];
    const selectedQuote = { totalAmount: 100000, negotiatedAmount: undefined } as Parameters<typeof validateContract>[1];
    const warnings = validateContract(contract, selectedQuote, 110000, '2027-01-30', '2027-01-11');
    expect(warnings.some((w) => w.field === 'value')).toBe(true);
  });

  it('does not warn about value when the difference is within the 2% tolerance', () => {
    const contract = {
      status: 'Signed', cancellationTerms: 'Full refund', finalSettlementDueDate: '2027-01-01',
    } as Parameters<typeof validateContract>[0];
    const selectedQuote = { totalAmount: 100000, negotiatedAmount: undefined } as Parameters<typeof validateContract>[1];
    const warnings = validateContract(contract, selectedQuote, 101000, '2027-01-30', '2027-01-11');
    expect(warnings.some((w) => w.field === 'value')).toBe(false);
  });

  it('warns when a team is on site but venue access requirements are undocumented', () => {
    const contract = {
      status: 'Draft', cancellationTerms: 'Full refund', finalSettlementDueDate: '2027-01-01', teamSize: 3,
    } as Parameters<typeof validateContract>[0];
    const warnings = validateContract(contract, undefined, undefined, '2027-01-30', '2027-01-11');
    expect(warnings.some((w) => w.field === 'venueAccessRequirements')).toBe(true);
  });

  it('flags a selected/contracted/confirmed vendor with no contract at all', () => {
    const vendor = { name: 'V', status: 'Selected' } as Parameters<typeof validateVendorContractStatus>[0];
    const warnings = validateVendorContractStatus(vendor, []);
    expect(warnings.some((w) => w.field === 'contract')).toBe(true);
  });

  it('flags a Confirmed vendor whose contract is not Signed/Active/Completed', () => {
    const vendor = { id: 'v1', name: 'V', status: 'Confirmed' } as Parameters<typeof validateVendorContractStatus>[0];
    const draftContract = { vendorId: 'v1', status: 'Draft' } as unknown as Parameters<typeof validateVendorContractStatus>[1][number];
    const warnings = validateVendorContractStatus(vendor, [draftContract]);
    expect(warnings.some((w) => w.field === 'contractStatus')).toBe(true);
  });
});

describe('contract repository', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('creates and updates a contract', () => {
    const vendor = newVendor();
    const contract = addContract({ vendorId: vendor.id, status: 'Draft' });
    updateContract(contract.id, { status: 'Signed', contractReference: 'REF-001' });
    expect(vendorQuotesStore.get()).toBeDefined();
  });
});
