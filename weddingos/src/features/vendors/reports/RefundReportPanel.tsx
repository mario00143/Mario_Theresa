import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { RefundStatusBadge } from '@/components/ui/StatusBadge';
import { useVendors } from '@/hooks/useVendors';
import { useRefunds } from '@/hooks/useRefunds';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { buildRefundReport } from '@/utils/financeReports';
import { refundsCsvFilename, refundsToCSV } from '@/data/repositories/financeCsv';
import { downloadTextFile } from '@/utils/download';
import { formatCurrency } from '@/utils/currency';

export function RefundReportPanel() {
  const { vendors } = useVendors();
  const { refunds } = useRefunds();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();
  const currency = settings.finance.currency;

  const rows = buildRefundReport(refunds, vendors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => downloadTextFile(refundsCsvFilename(), refundsToCSV(refunds, vendors), 'text/csv')}
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No refunds yet" description="Add a refund from a vendor's detail page." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.refund.id}
                    onClick={() => openVendorDetail(row.refund.vendorId)}
                    className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.refund.refundType}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.refund.expectedAmount ? formatCurrency(row.refund.expectedAmount, currency) : '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.refund.receivedAmount ? formatCurrency(row.refund.receivedAmount, currency) : '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.outstanding, currency)}</td>
                    <td className="px-4 py-3">
                      <RefundStatusBadge status={row.refund.status} />
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
