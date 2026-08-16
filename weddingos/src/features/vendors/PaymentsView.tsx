import { useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';
import type { PaymentSchedule } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PaymentScheduleStatusBadge, RefundStatusBadge } from '@/components/ui/StatusBadge';
import { useVendors } from '@/hooks/useVendors';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useBudgetItems } from '@/hooks/useBudget';
import { useRefunds } from '@/hooks/useRefunds';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { computePaymentScheduleStatus, dueBucketFor, scheduleBalance, totalPaidForSchedule, type DueBucket } from '@/utils/paymentLogic';
import { buildRefundReport } from '@/utils/financeReports';
import { todayISO } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { AddPaymentModal } from './AddPaymentModal';

const BUCKET_ORDER: DueBucket[] = ['Overdue', 'Due Today', 'Due in 7 Days', 'Due in 14 Days', 'Due in 30 Days', 'Later'];
const BUCKET_TONE: Record<DueBucket, string> = {
  Overdue: 'border-critical/40 bg-critical-bg',
  'Due Today': 'border-warning/40 bg-warning-bg',
  'Due in 7 Days': 'border-warning/30 bg-warning-bg/60',
  'Due in 14 Days': 'border-line bg-surface',
  'Due in 30 Days': 'border-line bg-surface',
  Later: 'border-line bg-surface',
};

export function PaymentsView() {
  const { vendors } = useVendors();
  const { paymentSchedules, cancelPaymentSchedule } = usePaymentSchedules();
  const { payments } = usePayments();
  const { budgetItems } = useBudgetItems();
  const { refunds } = useRefunds();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();
  const [paymentModal, setPaymentModal] = useState<{ vendorId: string; scheduleId: string } | null>(null);

  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors]);
  const refundRows = useMemo(() => buildRefundReport(refunds, vendors), [refunds, vendors]);
  const today = todayISO();

  const buckets = useMemo(() => {
    const map = new Map<DueBucket, { schedule: PaymentSchedule; outstanding: number }[]>();
    for (const b of BUCKET_ORDER) map.set(b, []);
    for (const schedule of paymentSchedules) {
      const bucket = dueBucketFor(schedule, payments);
      if (!bucket) continue;
      map.get(bucket)!.push({ schedule, outstanding: scheduleBalance(schedule, payments) });
    }
    return map;
  }, [paymentSchedules, payments]);

  const paidOrCancelledCount = paymentSchedules.filter((s) => {
    const status = computePaymentScheduleStatus(s, payments);
    return status === 'Paid' || status === 'Cancelled';
  }).length;

  if (paymentSchedules.length === 0) {
    return <EmptyState icon={<Receipt className="size-8" aria-hidden="true" />} title="No payment schedules yet" description="Add a payment schedule from a vendor's detail page." />;
  }

  return (
    <div className="space-y-5">
      {BUCKET_ORDER.map((bucket) => {
        const rows = buckets.get(bucket) ?? [];
        if (rows.length === 0) return null;
        const total = rows.reduce((sum, r) => sum + r.outstanding, 0);
        return (
          <Card key={bucket} className={BUCKET_TONE[bucket]}>
            <CardHeader>
              <CardTitle>
                {bucket} ({rows.length})
              </CardTitle>
              <span className="text-xs text-ink-faint">{formatCurrency(total, settings.finance.currency)} outstanding</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-line-soft">
                {rows.map(({ schedule, outstanding }) => {
                  const vendor = vendorById.get(schedule.vendorId);
                  const status = computePaymentScheduleStatus(schedule, payments);
                  const paid = totalPaidForSchedule(payments, schedule.id);
                  return (
                    <div key={schedule.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openVendorDetail(schedule.vendorId)}>
                        <p className="text-sm font-medium text-ink truncate">{vendor?.name ?? '—'} — {schedule.milestone}</p>
                        <p className="text-xs text-ink-faint">
                          Due {schedule.dueDate ?? '—'} · {formatCurrency(schedule.amount, settings.finance.currency)}
                          {paid > 0 && ` · paid ${formatCurrency(paid, settings.finance.currency)}`}
                          {outstanding > 0 && ` · outstanding ${formatCurrency(outstanding, settings.finance.currency)}`}
                        </p>
                      </div>
                      <PaymentScheduleStatusBadge status={status} />
                      <Button variant="secondary" size="sm" onClick={() => setPaymentModal({ vendorId: schedule.vendorId, scheduleId: schedule.id })}>
                        Record Payment
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cancelPaymentSchedule(schedule.id)}>
                        Cancel
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        );
      })}

      {paidOrCancelledCount > 0 && (
        <p className="text-xs text-ink-faint">
          {paidOrCancelledCount} payment schedule{paidOrCancelledCount === 1 ? '' : 's'} fully paid or cancelled — view them from a vendor's detail page.
        </p>
      )}

      {refundRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-line-soft">
              {refundRows.map(({ refund, vendor, outstanding }) => {
                const overdue = (refund.status === 'Expected' || refund.status === 'Partially Received') && !!refund.expectedDate && refund.expectedDate < today;
                return (
                  <div
                    key={refund.id}
                    className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-subtle"
                    onClick={() => openVendorDetail(refund.vendorId)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{vendor?.name ?? '—'} — {refund.refundType}</p>
                      <p className="text-xs text-ink-faint">
                        {refund.expectedAmount ? `Expected ${formatCurrency(refund.expectedAmount, settings.finance.currency)}` : 'No expected amount set'}
                        {refund.expectedDate && ` by ${refund.expectedDate}`}
                        {outstanding > 0 && ` · outstanding ${formatCurrency(outstanding, settings.finance.currency)}`}
                      </p>
                    </div>
                    {overdue && <Badge tone="critical">Overdue</Badge>}
                    <RefundStatusBadge status={refund.status} />
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {paymentModal && (
        <AddPaymentModal
          open
          onClose={() => setPaymentModal(null)}
          vendorId={paymentModal.vendorId}
          budgetItems={budgetItems.filter((i) => i.vendorId === paymentModal.vendorId)}
          schedules={paymentSchedules.filter((s) => s.vendorId === paymentModal.vendorId)}
          defaultScheduleId={paymentModal.scheduleId}
          largeCashWarningThreshold={settings.finance.largeCashWarningThreshold}
        />
      )}
    </div>
  );
}
