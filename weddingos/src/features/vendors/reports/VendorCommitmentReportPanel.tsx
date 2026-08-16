import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVendors } from '@/hooks/useVendors';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useBudgetItems } from '@/hooks/useBudget';
import { usePayments } from '@/hooks/usePayments';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { buildVendorCommitmentReport } from '@/utils/financeReports';
import { formatCurrency } from '@/utils/currency';

export function VendorCommitmentReportPanel() {
  const { vendors } = useVendors();
  const { vendorQuotes } = useVendorQuotes();
  const { budgetItems } = useBudgetItems();
  const { payments } = usePayments();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();
  const currency = settings.finance.currency;

  const rows = buildVendorCommitmentReport(vendors, vendorQuotes, budgetItems, payments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor commitments</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No vendors yet" description="Add vendors from the Vendors tab." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Committed</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.vendor.id}
                    onClick={() => openVendorDetail(row.vendor.id)}
                    className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.vendor.name}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{row.categoryLabel}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.committed, currency)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.paid, currency)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.outstanding, currency)}</td>
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
