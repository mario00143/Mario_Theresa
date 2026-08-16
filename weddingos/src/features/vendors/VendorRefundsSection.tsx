import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Contract, Refund } from '@/types';
import { REFUND_STATUSES, REFUND_TYPES } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RefundStatusBadge } from '@/components/ui/StatusBadge';
import { useRefunds, useRefundsForVendor } from '@/hooks/useRefunds';
import { formatCurrency } from '@/utils/currency';

function RefundRow({ refund, contracts, currency }: { refund: Refund; contracts: Contract[]; currency: string }) {
  const { updateRefund, deleteRefund } = useRefunds();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <RefundStatusBadge status={refund.status} />
          <span className="text-sm font-medium text-ink">{refund.refundType}</span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete refund"
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-type-${refund.id}`}>Refund type</Label>
          <Select id={`r-type-${refund.id}`} value={refund.refundType} onChange={(e) => updateRefund(refund.id, { refundType: e.target.value as Refund['refundType'] })}>
            {REFUND_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`r-status-${refund.id}`}>Status</Label>
          <Select id={`r-status-${refund.id}`} value={refund.status} onChange={(e) => updateRefund(refund.id, { status: e.target.value as Refund['status'] })}>
            {REFUND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-expected-amount-${refund.id}`}>Expected amount</Label>
          <Input
            id={`r-expected-amount-${refund.id}`}
            type="number"
            min={0}
            defaultValue={refund.expectedAmount ?? ''}
            key={`r-expected-amount-${refund.id}-${refund.expectedAmount}`}
            onBlur={(e) => updateRefund(refund.id, { expectedAmount: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`r-expected-date-${refund.id}`}>Expected date</Label>
          <Input id={`r-expected-date-${refund.id}`} type="date" value={refund.expectedDate ?? ''} onChange={(e) => updateRefund(refund.id, { expectedDate: e.target.value || undefined })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`r-received-amount-${refund.id}`}>Received amount</Label>
          <Input
            id={`r-received-amount-${refund.id}`}
            type="number"
            min={0}
            defaultValue={refund.receivedAmount ?? ''}
            key={`r-received-amount-${refund.id}-${refund.receivedAmount}`}
            onBlur={(e) => updateRefund(refund.id, { receivedAmount: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`r-received-date-${refund.id}`}>Received date</Label>
          <Input id={`r-received-date-${refund.id}`} type="date" value={refund.receivedDate ?? ''} onChange={(e) => updateRefund(refund.id, { receivedDate: e.target.value || undefined })} />
        </Field>
      </div>
      <Field>
        <Label htmlFor={`r-contract-${refund.id}`}>Contract</Label>
        <Select id={`r-contract-${refund.id}`} value={refund.contractId ?? ''} onChange={(e) => updateRefund(refund.id, { contractId: e.target.value || undefined })}>
          <option value="">None</option>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.contractReference ?? c.id}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        <Label htmlFor={`r-ref-${refund.id}`}>Reference number</Label>
        <Input id={`r-ref-${refund.id}`} defaultValue={refund.referenceNumber ?? ''} key={`r-ref-${refund.id}`} onBlur={(e) => updateRefund(refund.id, { referenceNumber: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`r-notes-${refund.id}`}>Notes</Label>
        <Textarea id={`r-notes-${refund.id}`} defaultValue={refund.notes ?? ''} key={`r-notes-${refund.id}`} onBlur={(e) => updateRefund(refund.id, { notes: e.target.value || undefined })} />
      </Field>
      {(refund.expectedAmount ?? 0) > 0 && (
        <p className="text-xs text-ink-faint">Outstanding: {formatCurrency(Math.max(0, (refund.expectedAmount ?? 0) - (refund.receivedAmount ?? 0)), currency)}</p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete refund"
        message="Delete this refund record? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteRefund(refund.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function VendorRefundsSection({ vendorId, contracts, currency }: { vendorId: string; contracts: Contract[]; currency: string }) {
  const refunds = useRefundsForVendor(vendorId);
  const { addRefund } = useRefunds();

  const handleAdd = () => {
    addRefund({ vendorId, refundType: 'Refundable Deposit', status: 'Expected' });
  };

  return (
    <section className="space-y-3 border-t border-line-soft pt-5">
      <p className="text-sm font-semibold text-ink">Refunds</p>
      {refunds.length === 0 && <p className="text-xs text-ink-faint">No refunds yet.</p>}
      <div className="space-y-2.5">
        {refunds.map((r) => (
          <RefundRow key={r.id} refund={r} contracts={contracts} currency={currency} />
        ))}
      </div>
      <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd}>
        Add Refund
      </Button>
    </section>
  );
}
