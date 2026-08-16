import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { PaymentScheduleStatusBadge } from '@/components/ui/StatusBadge';
import { useVendors } from '@/hooks/useVendors';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { buildPaymentDueReport } from '@/utils/financeReports';
import { paymentsDueCsvFilename, paymentsDueToCSV } from '@/data/repositories/financeCsv';
import { downloadTextFile } from '@/utils/download';
import { formatCurrency } from '@/utils/currency';

export function PaymentDueReportPanel() {
  const { vendors } = useVendors();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();
  const currency = settings.finance.currency;

  const rows = buildPaymentDueReport(paymentSchedules, vendors, payments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment due</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(paymentsDueCsvFilename(), paymentsDueToCSV(paymentSchedules, vendors, payments), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No payment schedules yet" description="Add a payment schedule from a vendor's detail page." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Milestone</th>
                  <th className="px-4 py-3">Due date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.schedule.id}
                    onClick={() => openVendorDetail(row.schedule.vendorId)}
                    className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.schedule.milestone}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.schedule.dueDate ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.schedule.amount, currency)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.outstanding, currency)}</td>
                    <td className="px-4 py-3">
                      <PaymentScheduleStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
