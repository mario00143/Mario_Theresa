import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Payment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { usePayments, usePaymentsForVendor } from '@/hooks/usePayments';
import { formatCurrency } from '@/utils/currency';
import { isLargeCashPayment } from '@/utils/paymentLogic';

function PaymentRow({ payment, currency, largeCashWarningThreshold }: { payment: Payment; currency: string; largeCashWarningThreshold: number }) {
  const { updatePayment, deletePayment } = usePayments();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isLargeCash = isLargeCashPayment(payment, largeCashWarningThreshold);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-ink">{formatCurrency(payment.amount, currency)}</span>
          <Badge tone="neutral">{payment.paymentMethod}</Badge>
          <span className="text-xs text-ink-faint">{payment.paymentDate}</span>
          {isLargeCash && <Badge tone="warning">Large cash</Badge>}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete payment"
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`p-ref-${payment.id}`}>Reference number</Label>
          <Input
            id={`p-ref-${payment.id}`}
            defaultValue={payment.referenceNumber ?? ''}
            key={`p-ref-${payment.id}`}
            onBlur={(e) => updatePayment(payment.id, { referenceNumber: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`p-paidby-${payment.id}`}>Paid by</Label>
          <Input
            id={`p-paidby-${payment.id}`}
            defaultValue={payment.paidBy ?? ''}
            key={`p-paidby-${payment.id}`}
            onBlur={(e) => updatePayment(payment.id, { paidBy: e.target.value || undefined })}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={payment.invoiceReceived} onChange={(e) => updatePayment(payment.id, { invoiceReceived: e.target.checked })} className="size-4 accent-brand-700" />
          Invoice received
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={payment.receiptReceived} onChange={(e) => updatePayment(payment.id, { receiptReceived: e.target.checked })} className="size-4 accent-brand-700" />
          Receipt received
        </label>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete payment"
        message="Delete this payment record? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deletePayment(payment.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function VendorPaymentsSection({
  vendorId,
  currency,
  largeCashWarningThreshold,
  onAddPayment,
}: {
  vendorId: string;
  currency: string;
  largeCashWarningThreshold: number;
  onAddPayment: () => void;
}) {
  const payments = usePaymentsForVendor(vendorId);
  const sorted = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  return (
    <section className="space-y-3 border-t border-line-soft pt-5">
      <p className="text-sm font-semibold text-ink">Payments</p>
      {sorted.length === 0 && <p className="text-xs text-ink-faint">No payments recorded yet.</p>}
      <div className="space-y-2.5">
        {sorted.map((p) => (
          <PaymentRow key={p.id} payment={p} currency={currency} largeCashWarningThreshold={largeCashWarningThreshold} />
        ))}
      </div>
      <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={onAddPayment}>
        Record Payment
      </Button>
    </section>
  );
}
