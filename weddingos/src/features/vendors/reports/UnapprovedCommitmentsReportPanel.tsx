import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useVendors } from '@/hooks/useVendors';
import { useBudgetItems } from '@/hooks/useBudget';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { buildUnapprovedCommitmentsReport } from '@/utils/financeReports';
import { formatCurrency } from '@/utils/currency';

export function UnapprovedCommitmentsReportPanel() {
  const { vendors } = useVendors();
  const { budgetItems } = useBudgetItems();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();
  const currency = settings.finance.currency;

  const rows = buildUnapprovedCommitmentsReport(budgetItems, vendors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unapproved commitments</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No unapproved commitments" description="Every committed budget item is Approved." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Committed</th>
                  <th className="px-4 py-3">Approval status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.item.id}
                    onClick={() => row.vendor && openVendorDetail(row.vendor.id)}
                    className={`border-b border-line-soft last:border-0 ${row.vendor ? 'cursor-pointer hover:bg-surface-subtle' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.item.itemName}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.item.committedAmount ?? 0, currency)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.item.approvalStatus === 'Rejected' ? 'danger' : 'warning'}>{row.item.approvalStatus}</Badge>
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
