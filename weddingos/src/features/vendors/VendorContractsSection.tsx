import { useState } from 'react';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import type { Contract, VendorQuote } from '@/types';
import { CONTRACT_STATUSES } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ContractStatusBadge } from '@/components/ui/StatusBadge';
import { useContracts, useContractsForVendor } from '@/hooks/useContracts';
import { useVendorQuotesForVendor } from '@/hooks/useVendorQuotes';
import { vendorCommittedAmount } from '@/utils/financeStats';
import { validateContract } from '@/utils/contractLogic';
import { useBudgetItems } from '@/hooks/useBudget';

interface ContractRowProps {
  contract: Contract;
  quotes: VendorQuote[];
  committedAmount: number;
  weddingDate: string;
  engagementDate: string;
}

function ContractRow({ contract, quotes, committedAmount, weddingDate, engagementDate }: ContractRowProps) {
  const { updateContract, deleteContract } = useContracts();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selectedQuote = quotes.find((q) => q.isSelected);
  const warnings = validateContract(contract, selectedQuote, committedAmount || undefined, weddingDate, engagementDate);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <ContractStatusBadge status={contract.status} />
          {contract.contractReference && <span className="text-sm font-medium text-ink">{contract.contractReference}</span>}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete contract"
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 space-y-1">
          {warnings.map((w) => (
            <p key={w.field} className="flex items-start gap-1.5 text-xs text-warning">
              <TriangleAlert className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              {w.message}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`c-ref-${contract.id}`}>Contract reference</Label>
          <Input
            id={`c-ref-${contract.id}`}
            defaultValue={contract.contractReference ?? ''}
            key={`c-ref-${contract.id}`}
            onBlur={(e) => updateContract(contract.id, { contractReference: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`c-status-${contract.id}`}>Status</Label>
          <Select
            id={`c-status-${contract.id}`}
            value={contract.status}
            onChange={(e) => updateContract(contract.id, { status: e.target.value as Contract['status'] })}
          >
            {CONTRACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`c-date-${contract.id}`}>Contract date</Label>
          <Input id={`c-date-${contract.id}`} type="date" value={contract.contractDate ?? ''} onChange={(e) => updateContract(contract.id, { contractDate: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-quote-${contract.id}`}>Linked quote</Label>
          <Select
            id={`c-quote-${contract.id}`}
            value={contract.quoteId ?? ''}
            onChange={(e) => updateContract(contract.id, { quoteId: e.target.value || undefined })}
          >
            <option value="">None</option>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quoteReference ?? q.id} {q.isSelected ? '(selected)' : ''}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide pt-1">Scope</p>
      <Field>
        <Label htmlFor={`c-scope-in-${contract.id}`}>Scope included</Label>
        <Textarea id={`c-scope-in-${contract.id}`} defaultValue={contract.scopeIncluded ?? ''} key={`c-scope-in-${contract.id}`} onBlur={(e) => updateContract(contract.id, { scopeIncluded: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`c-scope-out-${contract.id}`}>Scope excluded</Label>
        <Textarea id={`c-scope-out-${contract.id}`} defaultValue={contract.scopeExcluded ?? ''} key={`c-scope-out-${contract.id}`} onBlur={(e) => updateContract(contract.id, { scopeExcluded: e.target.value || undefined })} />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`c-deliverables-${contract.id}`}>Deliverables</Label>
          <Textarea id={`c-deliverables-${contract.id}`} defaultValue={contract.deliverables ?? ''} key={`c-deliverables-${contract.id}`} onBlur={(e) => updateContract(contract.id, { deliverables: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-qty-${contract.id}`}>Quantity assumptions</Label>
          <Textarea id={`c-qty-${contract.id}`} defaultValue={contract.quantityAssumptions ?? ''} key={`c-qty-${contract.id}`} onBlur={(e) => updateContract(contract.id, { quantityAssumptions: e.target.value || undefined })} />
        </Field>
      </div>

      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide pt-1">Schedule</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`c-setup-date-${contract.id}`}>Setup date</Label>
          <Input id={`c-setup-date-${contract.id}`} type="date" value={contract.setupDate ?? ''} onChange={(e) => updateContract(contract.id, { setupDate: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-setup-time-${contract.id}`}>Setup time</Label>
          <Input id={`c-setup-time-${contract.id}`} type="time" value={contract.setupTime ?? ''} onChange={(e) => updateContract(contract.id, { setupTime: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-start-date-${contract.id}`}>Service start date</Label>
          <Input id={`c-start-date-${contract.id}`} type="date" value={contract.serviceStartDate ?? ''} onChange={(e) => updateContract(contract.id, { serviceStartDate: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-start-time-${contract.id}`}>Service start time</Label>
          <Input id={`c-start-time-${contract.id}`} type="time" value={contract.serviceStartTime ?? ''} onChange={(e) => updateContract(contract.id, { serviceStartTime: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-end-date-${contract.id}`}>Service end date</Label>
          <Input id={`c-end-date-${contract.id}`} type="date" value={contract.serviceEndDate ?? ''} onChange={(e) => updateContract(contract.id, { serviceEndDate: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-end-time-${contract.id}`}>Service end time</Label>
          <Input id={`c-end-time-${contract.id}`} type="time" value={contract.serviceEndTime ?? ''} onChange={(e) => updateContract(contract.id, { serviceEndTime: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-teardown-${contract.id}`}>Teardown deadline</Label>
          <Input id={`c-teardown-${contract.id}`} type="date" value={contract.teardownDeadline ?? ''} onChange={(e) => updateContract(contract.id, { teardownDeadline: e.target.value || undefined })} />
        </Field>
      </div>

      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide pt-1">Operations</p>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`c-team-${contract.id}`}>Team size</Label>
          <Input
            id={`c-team-${contract.id}`}
            type="number"
            min={0}
            defaultValue={contract.teamSize ?? ''}
            key={`c-team-${contract.id}-${contract.teamSize}`}
            onBlur={(e) => updateContract(contract.id, { teamSize: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`c-meals-${contract.id}`}>Vendor meal count</Label>
          <Input
            id={`c-meals-${contract.id}`}
            type="number"
            min={0}
            defaultValue={contract.vendorMealCount ?? ''}
            key={`c-meals-${contract.id}-${contract.vendorMealCount}`}
            onBlur={(e) => updateContract(contract.id, { vendorMealCount: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </Field>
      </div>
      <Field>
        <Label htmlFor={`c-power-${contract.id}`}>Power requirements</Label>
        <Input id={`c-power-${contract.id}`} defaultValue={contract.powerRequirements ?? ''} key={`c-power-${contract.id}`} onBlur={(e) => updateContract(contract.id, { powerRequirements: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`c-transport-${contract.id}`}>Transport requirements</Label>
        <Input id={`c-transport-${contract.id}`} defaultValue={contract.transportRequirements ?? ''} key={`c-transport-${contract.id}`} onBlur={(e) => updateContract(contract.id, { transportRequirements: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`c-access-${contract.id}`}>Venue access requirements</Label>
        <Input id={`c-access-${contract.id}`} defaultValue={contract.venueAccessRequirements ?? ''} key={`c-access-${contract.id}`} onBlur={(e) => updateContract(contract.id, { venueAccessRequirements: e.target.value || undefined })} />
      </Field>

      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide pt-1">Terms</p>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`c-cancel-${contract.id}`}>Cancellation terms</Label>
          <Textarea id={`c-cancel-${contract.id}`} defaultValue={contract.cancellationTerms ?? ''} key={`c-cancel-${contract.id}`} onBlur={(e) => updateContract(contract.id, { cancellationTerms: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-reschedule-${contract.id}`}>Reschedule terms</Label>
          <Textarea id={`c-reschedule-${contract.id}`} defaultValue={contract.rescheduleTerms ?? ''} key={`c-reschedule-${contract.id}`} onBlur={(e) => updateContract(contract.id, { rescheduleTerms: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-replacement-${contract.id}`}>Replacement policy</Label>
          <Textarea id={`c-replacement-${contract.id}`} defaultValue={contract.replacementPolicy ?? ''} key={`c-replacement-${contract.id}`} onBlur={(e) => updateContract(contract.id, { replacementPolicy: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`c-liability-${contract.id}`}>Liability notes</Label>
          <Textarea id={`c-liability-${contract.id}`} defaultValue={contract.liabilityNotes ?? ''} key={`c-liability-${contract.id}`} onBlur={(e) => updateContract(contract.id, { liabilityNotes: e.target.value || undefined })} />
        </Field>
      </div>

      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide pt-1">Financial</p>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`c-deposit-${contract.id}`}>Refundable deposit</Label>
          <Input
            id={`c-deposit-${contract.id}`}
            type="number"
            min={0}
            defaultValue={contract.refundableDeposit ?? ''}
            key={`c-deposit-${contract.id}-${contract.refundableDeposit}`}
            onBlur={(e) => updateContract(contract.id, { refundableDeposit: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`c-settlement-${contract.id}`}>Final settlement due date</Label>
          <Input id={`c-settlement-${contract.id}`} type="date" value={contract.finalSettlementDueDate ?? ''} onChange={(e) => updateContract(contract.id, { finalSettlementDueDate: e.target.value || undefined })} />
        </Field>
      </div>
      <FieldHint>Contract metadata/reference only — no scanned document files are stored.</FieldHint>

      <Field>
        <Label htmlFor={`c-notes-${contract.id}`}>Notes</Label>
        <Textarea id={`c-notes-${contract.id}`} defaultValue={contract.notes ?? ''} key={`c-notes-${contract.id}`} onBlur={(e) => updateContract(contract.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete contract"
        message="Delete this contract? Payment schedules and refunds linked to it will be un-linked, not deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteContract(contract.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function VendorContractsSection({ vendorId, weddingDate, engagementDate }: { vendorId: string; weddingDate: string; engagementDate: string }) {
  const contracts = useContractsForVendor(vendorId);
  const quotes = useVendorQuotesForVendor(vendorId);
  const { addContract } = useContracts();
  const { budgetItems } = useBudgetItems();
  const committedAmount = vendorCommittedAmount(vendorId, budgetItems);

  const handleAdd = () => {
    addContract({ vendorId, status: 'Draft' });
  };

  return (
    <section className="space-y-3 border-t border-line-soft pt-5">
      <p className="text-sm font-semibold text-ink">Contracts</p>
      {contracts.length === 0 && <p className="text-xs text-ink-faint">No contracts yet.</p>}
      <div className="space-y-3">
        {contracts.map((c) => (
          <ContractRow key={c.id} contract={c} quotes={quotes} committedAmount={committedAmount} weddingDate={weddingDate} engagementDate={engagementDate} />
        ))}
      </div>
      <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd}>
        Add Contract
      </Button>
    </section>
  );
}
