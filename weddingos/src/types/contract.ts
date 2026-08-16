export const CONTRACT_STATUSES = ['Draft', 'Under Review', 'Signed', 'Active', 'Completed', 'Cancelled'] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

/**
 * Contract metadata/reference only — no scanned document binaries are
 * stored in localStorage. Actual file storage arrives with Supabase.
 */
export interface Contract {
  id: string;
  vendorId: string;
  quoteId?: string;
  contractReference?: string;
  contractDate?: string;
  status: ContractStatus;
  scopeIncluded?: string;
  scopeExcluded?: string;
  deliverables?: string;
  quantityAssumptions?: string;
  setupDate?: string;
  setupTime?: string;
  serviceStartDate?: string;
  serviceStartTime?: string;
  serviceEndDate?: string;
  serviceEndTime?: string;
  teardownDeadline?: string;
  teamSize?: number;
  vendorMealCount?: number;
  powerRequirements?: string;
  transportRequirements?: string;
  venueAccessRequirements?: string;
  cancellationTerms?: string;
  rescheduleTerms?: string;
  replacementPolicy?: string;
  liabilityNotes?: string;
  refundableDeposit?: number;
  finalSettlementDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
