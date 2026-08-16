import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EventScope, VendorQuote } from '@/types';
import { QUOTE_STATUSES } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuoteStatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { useVendorQuotes, useVendorQuotesForVendor } from '@/hooks/useVendorQuotes';
import { formatCurrency } from '@/utils/currency';
import { isQuoteExpired, isQuoteExpiringSoon } from '@/utils/quoteLogic';

function numberOrZero(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function QuoteRow({ quote }: { quote: VendorQuote }) {
  const { updateVendorQuote, deleteVendorQuote, selectVendorQuote, rejectVendorQuote, markVendorQuoteNegotiating } = useVendorQuotes();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const expired = isQuoteExpired(quote);
  const expiringSoon = !expired && isQuoteExpiringSoon(quote);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <QuoteStatusBadge status={quote.status} />
          {quote.isSelected && <Badge tone="success">Selected</Badge>}
          {expired && <Badge tone="danger">Expired</Badge>}
          {expiringSoon && <Badge tone="warning">Expiring soon</Badge>}
          <span className="text-sm font-semibold text-ink">{formatCurrency(quote.totalAmount, quote.currency)}</span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete quote"
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`q-ref-${quote.id}`}>Quote reference</Label>
          <Input
            id={`q-ref-${quote.id}`}
            defaultValue={quote.quoteReference ?? ''}
            key={`q-ref-${quote.id}`}
            onBlur={(e) => updateVendorQuote(quote.id, { quoteReference: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`q-valid-${quote.id}`}>Valid until</Label>
          <Input
            id={`q-valid-${quote.id}`}
            type="date"
            value={quote.validUntil ?? ''}
            onChange={(e) => updateVendorQuote(quote.id, { validUntil: e.target.value || undefined })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`q-base-${quote.id}`}>Base amount</Label>
          <Input
            id={`q-base-${quote.id}`}
            type="number"
            min={0}
            defaultValue={quote.baseAmount}
            key={`q-base-${quote.id}-${quote.baseAmount}`}
            onBlur={(e) => updateVendorQuote(quote.id, { baseAmount: numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`q-discount-${quote.id}`}>Discount</Label>
          <Input
            id={`q-discount-${quote.id}`}
            type="number"
            min={0}
            defaultValue={quote.discountAmount}
            key={`q-discount-${quote.id}-${quote.discountAmount}`}
            onBlur={(e) => updateVendorQuote(quote.id, { discountAmount: numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`q-tax-${quote.id}`}>Tax</Label>
          <Input
            id={`q-tax-${quote.id}`}
            type="number"
            min={0}
            defaultValue={quote.taxAmount}
            key={`q-tax-${quote.id}-${quote.taxAmount}`}
            onBlur={(e) => updateVendorQuote(quote.id, { taxAmount: numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`q-other-${quote.id}`}>Other charges</Label>
          <Input
            id={`q-other-${quote.id}`}
            type="number"
            min={0}
            defaultValue={quote.otherCharges}
            key={`q-other-${quote.id}-${quote.otherCharges}`}
            onBlur={(e) => updateVendorQuote(quote.id, { otherCharges: numberOrZero(e.target.value) })}
          />
        </Field>
      </div>

      <Field>
        <Label htmlFor={`q-negotiated-${quote.id}`}>Negotiated amount</Label>
        <Input
          id={`q-negotiated-${quote.id}`}
          type="number"
          min={0}
          defaultValue={quote.negotiatedAmount ?? ''}
          key={`q-negotiated-${quote.id}-${quote.negotiatedAmount}`}
          onBlur={(e) => updateVendorQuote(quote.id, { negotiatedAmount: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          placeholder="Not negotiated"
        />
        <FieldHint>Total amount ({formatCurrency(quote.totalAmount, quote.currency)}) always reflects base − discount + tax + other charges.</FieldHint>
      </Field>

      <Field>
        <Label htmlFor={`q-scope-${quote.id}`}>Scope summary</Label>
        <Textarea
          id={`q-scope-${quote.id}`}
          defaultValue={quote.scopeSummary ?? ''}
          key={`q-scope-${quote.id}`}
          onBlur={(e) => updateVendorQuote(quote.id, { scopeSummary: e.target.value || undefined })}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={quote.isSelected} onClick={() => selectVendorQuote(quote.id)}>
          Select Quote
        </Button>
        <Button variant="ghost" size="sm" disabled={quote.status === 'Negotiating'} onClick={() => markVendorQuoteNegotiating(quote.id)}>
          Mark Negotiating
        </Button>
        <Button variant="ghost" size="sm" disabled={quote.status === 'Rejected'} onClick={() => rejectVendorQuote(quote.id)}>
          Reject
        </Button>
        <Select
          aria-label="Quote status"
          value={quote.status}
          onChange={(e) => updateVendorQuote(quote.id, { status: e.target.value as VendorQuote['status'] })}
          className="w-auto! min-w-[8rem] ml-auto"
        >
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete quote"
        message="Delete this quote? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteVendorQuote(quote.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function VendorQuotesSection({ vendorId, vendorEvent, currency }: { vendorId: string; vendorEvent: EventScope; currency: string }) {
  const quotes = useVendorQuotesForVendor(vendorId);
  const { addVendorQuote } = useVendorQuotes();
  const [newAmount, setNewAmount] = useState('');

  const handleAdd = () => {
    const baseAmount = numberOrZero(newAmount);
    if (baseAmount <= 0) return;
    addVendorQuote({
      vendorId,
      event: vendorEvent === 'Both' ? 'Wedding' : vendorEvent,
      baseAmount,
      discountAmount: 0,
      taxAmount: 0,
      otherCharges: 0,
      currency,
      status: 'Received',
      isSelected: false,
    });
    setNewAmount('');
  };

  return (
    <section className="space-y-3 border-t border-line-soft pt-5">
      <p className="text-sm font-semibold text-ink">Quotes</p>
      {quotes.length === 0 && <p className="text-xs text-ink-faint">No quotes yet.</p>}
      <div className="space-y-2.5">
        {quotes.map((q) => (
          <QuoteRow key={q.id} quote={q} />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          placeholder="New quote base amount…"
          aria-label="New quote base amount"
        />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={numberOrZero(newAmount) <= 0}>
          Add Quote
        </Button>
      </div>
    </section>
  );
}
