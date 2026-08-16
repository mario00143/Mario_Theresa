import type { Contract, Vendor, VendorQuote } from '@/types';
import { effectiveQuoteAmount } from './financeCalc';

export interface ContractWarning {
  field: string;
  message: string;
}

/** A contract value is "material" different from the selected quote/commitment beyond this fraction. */
const MATERIAL_DIFFERENCE_RATIO = 0.02;

const VENDOR_STATUSES_REQUIRING_CONTRACT: Vendor['status'][] = ['Selected', 'Contracted', 'Confirmed', 'Completed'];

/**
 * Section 10 checks that apply to a specific contract (given its vendor's
 * selected quote and committed budget amount, if any).
 */
export function validateContract(
  contract: Contract,
  selectedQuote: VendorQuote | undefined,
  committedAmount: number | undefined,
  weddingDate: string,
  engagementDate: string,
): ContractWarning[] {
  const warnings: ContractWarning[] = [];

  if (contract.status === 'Signed' && !selectedQuote) {
    warnings.push({ field: 'quoteId', message: 'Contract is Signed but no selected quote exists for this vendor.' });
  }

  const referenceAmount = selectedQuote ? effectiveQuoteAmount(selectedQuote) : committedAmount;
  if (referenceAmount !== undefined && referenceAmount > 0 && committedAmount !== undefined) {
    const diff = Math.abs(committedAmount - referenceAmount);
    if (diff / referenceAmount > MATERIAL_DIFFERENCE_RATIO) {
      warnings.push({ field: 'value', message: 'Contract value differs materially from the selected quote / budget commitment.' });
    }
  }

  if (!contract.cancellationTerms?.trim()) {
    warnings.push({ field: 'cancellationTerms', message: 'Cancellation terms are empty.' });
  }
  if (!contract.finalSettlementDueDate) {
    warnings.push({ field: 'finalSettlementDueDate', message: 'Final settlement date is missing.' });
  }

  if (contract.serviceStartDate && contract.serviceStartDate !== weddingDate && contract.serviceStartDate !== engagementDate) {
    warnings.push({ field: 'serviceStartDate', message: `Contract service date (${contract.serviceStartDate}) does not align with the Engagement or Wedding date.` });
  }

  const teamOnSite = (contract.teamSize ?? 0) > 0;
  if (teamOnSite && !contract.venueAccessRequirements?.trim()) {
    warnings.push({ field: 'venueAccessRequirements', message: 'Vendor needs venue access but the access requirement is not documented.' });
  }

  return warnings;
}

export interface VendorContractStatusWarning {
  field: string;
  message: string;
}

/** Vendor-level checks: does a selected/contracted/confirmed vendor actually have a contract, and is it signed if the vendor is Confirmed? */
export function validateVendorContractStatus(vendor: Vendor, vendorContracts: Contract[]): VendorContractStatusWarning[] {
  const warnings: VendorContractStatusWarning[] = [];

  if (VENDOR_STATUSES_REQUIRING_CONTRACT.includes(vendor.status) && vendorContracts.length === 0) {
    warnings.push({ field: 'contract', message: `"${vendor.name}" is ${vendor.status} but has no contract on file.` });
  }

  if (vendor.status === 'Confirmed' && !vendorContracts.some((c) => c.status === 'Signed' || c.status === 'Active' || c.status === 'Completed')) {
    warnings.push({ field: 'contractStatus', message: `"${vendor.name}" is Confirmed but its contract is not Signed.` });
  }

  return warnings;
}
