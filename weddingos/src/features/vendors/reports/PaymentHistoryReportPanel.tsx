import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useVendors } from '@/hooks/useVendors';
import { usePayments } from '@/hooks/usePayments';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { buildPaymentHistoryReport } from '@/utils/financeReports';
import { paymentHistoryCsvFilename, paymentHistoryToCSV } from '@/data/repositories/financeCsv';
import { downloadTextFile } from '@/utils/download';
import { formatCurrency } from '@/utils/currency';
import { isLargeCashPayment } from '@/utils/paymentLogic';

export function PaymentHistoryReportPanel() {
  const { vendors } = useVendors();
  const { payments } = usePayments();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();
  const currency = settings.finance.currency;

  const rows = buildPaymentHistoryReport(payments, vendors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment history</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(paymentHistoryCsvFilename(), paymentHistoryToCSV(payments, vendors), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No payments recorded yet" description="Record a payment from a vendor's detail page." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.payment.id}
                    onClick={() => openVendorDetail(row.payment.vendorId)}
                    className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.payment.paymentDate}</td>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.payment.amount, currency)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.payment.paymentMethod}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.payment.referenceNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      {isLargeCashPayment(row.payment, settings.finance.largeCashWarningThreshold) && <Badge tone="warning">Large cash</Badge>}
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
