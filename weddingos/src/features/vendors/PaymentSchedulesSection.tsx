import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BudgetItem, Contract, PaymentSchedule } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PaymentScheduleStatusBadge } from '@/components/ui/StatusBadge';
import { usePaymentSchedules, usePaymentSchedulesForVendor } from '@/hooks/usePaymentSchedules';
import { usePaymentsForVendor } from '@/hooks/usePayments';
import { computePaymentScheduleStatus, scheduleBalance, totalPaidForSchedule } from '@/utils/paymentLogic';
import { formatCurrency } from '@/utils/currency';

interface ScheduleRowProps {
  schedule: PaymentSchedule;
  payments: ReturnType<typeof usePaymentsForVendor>;
  budgetItems: BudgetItem[];
  contracts: Contract[];
  currency: string;
  onRecordPayment: (scheduleId: string) => void;
}

function ScheduleRow({ schedule, payments, budgetItems, contracts, currency, onRecordPayment }: ScheduleRowProps) {
  const { updatePaymentSchedule, cancelPaymentSchedule, deletePaymentSchedule } = usePaymentSchedules();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = computePaymentScheduleStatus(schedule, payments);
  const paid = totalPaidForSchedule(payments, schedule.id);
  const outstanding = scheduleBalance(schedule, payments);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <PaymentScheduleStatusBadge status={status} />
          <span className="text-sm font-semibold text-ink">{formatCurrency(schedule.amount, currency)}</span>
          {paid > 0 && <span className="text-xs text-ink-faint">paid {formatCurrency(paid, currency)}, outstanding {formatCurrency(outstanding, currency)}</span>}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete payment schedule"
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`sched-milestone-${schedule.id}`}>Milestone</Label>
          <Input
            id={`sched-milestone-${schedule.id}`}
            defaultValue={schedule.milestone}
            key={`sched-milestone-${schedule.id}`}
            onBlur={(e) => updatePaymentSchedule(schedule.id, { milestone: e.target.value })}
          />
        </Field>
        <Field>
          <Label htmlFor={`sched-due-${schedule.id}`}>Due date</Label>
          <Input id={`sched-due-${schedule.id}`} type="date" value={schedule.dueDate ?? ''} onChange={(e) => updatePaymentSchedule(schedule.id, { dueDate: e.target.value || undefined })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`sched-amount-${schedule.id}`}>Amount</Label>
          <Input
            id={`sched-amount-${schedule.id}`}
            type="number"
            min={0}
            defaultValue={schedule.amount}
            key={`sched-amount-${schedule.id}-${schedule.amount}`}
            onBlur={(e) => updatePaymentSchedule(schedule.id, { amount: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field>
          <Label htmlFor={`sched-budget-item-${schedule.id}`}>Budget item</Label>
          <Select id={`sched-budget-item-${schedule.id}`} value={schedule.budgetItemId ?? ''} onChange={(e) => updatePaymentSchedule(schedule.id, { budgetItemId: e.target.value || undefined })}>
            <option value="">None</option>
            {budgetItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.itemName}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field>
        <Label htmlFor={`sched-contract-${schedule.id}`}>Contract</Label>
        <Select id={`sched-contract-${schedule.id}`} value={schedule.contractId ?? ''} onChange={(e) => updatePaymentSchedule(schedule.id, { contractId: e.target.value || undefined })}>
          <option value="">None</option>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.contractReference ?? c.id}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        <Label htmlFor={`sched-notes-${schedule.id}`}>Notes</Label>
        <Textarea id={`sched-notes-${schedule.id}`} defaultValue={schedule.notes ?? ''} key={`sched-notes-${schedule.id}`} onBlur={(e) => updatePaymentSchedule(schedule.id, { notes: e.target.value || undefined })} />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => onRecordPayment(schedule.id)} disabled={status === 'Cancelled'}>
          Record Payment
        </Button>
        <Button variant="ghost" size="sm" onClick={() => cancelPaymentSchedule(schedule.id)} disabled={schedule.status === 'Cancelled'}>
          Cancel Schedule
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete payment schedule"
        message="Delete this payment schedule? Any payments already recorded against it will be un-linked, not deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deletePaymentSchedule(schedule.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

interface PaymentSchedulesSectionProps {
  vendorId: string;
  budgetItems: BudgetItem[];
  contracts: Contract[];
  currency: string;
  onRecordPayment: (scheduleId: string) => void;
}

export function PaymentSchedulesSection({ vendorId, budgetItems, contracts, currency, onRecordPayment }: PaymentSchedulesSectionProps) {
  const schedules = usePaymentSchedulesForVendor(vendorId);
  const payments = usePaymentsForVendor(vendorId);
  const { addPaymentSchedule } = usePaymentSchedules();
  const [newMilestone, setNewMilestone] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAdd = () => {
    const amount = Number(newAmount);
    if (!newMilestone.trim() || !(amount > 0)) return;
    addPaymentSchedule({ vendorId, milestone: newMilestone.trim(), amount, status: 'Upcoming' });
    setNewMilestone('');
    setNewAmount('');
  };

  return (
    <section className="space-y-3 border-t border-line-soft pt-5">
      <p className="text-sm font-semibold text-ink">Payment schedule</p>
      {schedules.length === 0 && <p className="text-xs text-ink-faint">No payment schedule yet.</p>}
      <div className="space-y-2.5">
        {schedules.map((s) => (
          <ScheduleRow key={s.id} schedule={s} payments={payments} budgetItems={budgetItems} contracts={contracts} currency={currency} onRecordPayment={onRecordPayment} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} placeholder="Milestone name…" className="min-w-[10rem] flex-1" aria-label="New milestone name" />
        <Input type="number" min={0} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Amount" className="w-32" aria-label="New milestone amount" />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newMilestone.trim() || !(Number(newAmount) > 0)}>
          Add Payment Schedule
        </Button>
      </div>
    </section>
  );
}
