import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { PAYMENT_METHODS, type BudgetItem, type PaymentMethod, type PaymentSchedule } from '@/types';
import { usePayments } from '@/hooks/usePayments';
import { InvalidPaymentAmountError, PaymentLinkedEntityNotFoundError } from '@/data/repositories/paymentRepository';
import { todayISO } from '@/utils/date';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  budgetItems: BudgetItem[];
  schedules: PaymentSchedule[];
  defaultScheduleId?: string;
  largeCashWarningThreshold: number;
}

export function AddPaymentModal({ open, onClose, vendorId, budgetItems, schedules, defaultScheduleId, largeCashWarningThreshold }: AddPaymentModalProps) {
  const { addPayment } = usePayments();
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [budgetItemId, setBudgetItemId] = useState('');
  const [paymentScheduleId, setPaymentScheduleId] = useState(defaultScheduleId ?? '');
  const [invoiceReceived, setInvoiceReceived] = useState(false);
  const [receiptReceived, setReceiptReceived] = useState(false);
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAmount('');
    setPaymentDate(todayISO());
    setPaymentMethod('Bank Transfer');
    setReferenceNumber('');
    setBudgetItemId('');
    setPaymentScheduleId(defaultScheduleId ?? '');
    setInvoiceReceived(false);
    setReceiptReceived(false);
    setPaidBy('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const amountNumber = Number(amount);
  const isValid = amount.trim() !== '' && amountNumber > 0 && paymentDate.trim() !== '';
  const showLargeCashWarning = paymentMethod === 'Cash' && amountNumber >= largeCashWarningThreshold;

  const handleSubmit = () => {
    if (!isValid) return;
    try {
      addPayment({
        vendorId,
        budgetItemId: budgetItemId || undefined,
        paymentScheduleId: paymentScheduleId || undefined,
        paymentDate,
        amount: amountNumber,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        invoiceReceived,
        receiptReceived,
        paidBy: paidBy.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      if (err instanceof InvalidPaymentAmountError || err instanceof PaymentLinkedEntityNotFoundError) {
        setError(err.message);
      } else {
        setError('Could not record this payment.');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Record Payment"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            Record Payment
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="pay-amount" required>
              Amount
            </Label>
            <Input id="pay-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </Field>
          <Field>
            <Label htmlFor="pay-date" required>
              Payment date
            </Label>
            <Input id="pay-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="pay-method" required>
              Payment method
            </Label>
            <Select id="pay-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="pay-ref">Reference number</Label>
            <Input id="pay-ref" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Transaction / UTR id" />
          </Field>
        </div>
        {showLargeCashWarning && (
          <p className="text-xs text-warning">This is a large cash payment (≥ the configured threshold). Consider a traceable method.</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="pay-budget-item">Budget item</Label>
            <Select id="pay-budget-item" value={budgetItemId} onChange={(e) => setBudgetItemId(e.target.value)}>
              <option value="">None</option>
              {budgetItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.itemName}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="pay-schedule">Payment schedule</Label>
            <Select id="pay-schedule" value={paymentScheduleId} onChange={(e) => setPaymentScheduleId(e.target.value)}>
              <option value="">None</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.milestone}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field>
          <Label htmlFor="pay-paidby">Paid by</Label>
          <Input id="pay-paidby" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={invoiceReceived} onChange={(e) => setInvoiceReceived(e.target.checked)} className="size-4 accent-brand-700" />
            Invoice received
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={receiptReceived} onChange={(e) => setReceiptReceived(e.target.checked)} className="size-4 accent-brand-700" />
            Receipt received
          </label>
        </div>
        <Field>
          <Label htmlFor="pay-notes">Notes</Label>
          <Textarea id="pay-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <FieldError>{error}</FieldError>
      </div>
    </Modal>
  );
}
