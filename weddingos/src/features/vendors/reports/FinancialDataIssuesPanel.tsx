import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVendors } from '@/hooks/useVendors';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useContracts } from '@/hooks/useContracts';
import { useBudgetCategories, useBudgetItems } from '@/hooks/useBudget';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useRefunds } from '@/hooks/useRefunds';
import { useSettings } from '@/hooks/useSettings';
import { useUI } from '@/context/UIContext';
import { detectFinancialIssues } from '@/utils/financialDataQuality';
import { weddingDateTimeISO } from '@/utils/date';

export function FinancialDataIssuesPanel() {
  const { vendors } = useVendors();
  const { vendorQuotes } = useVendorQuotes();
  const { contracts } = useContracts();
  const { budgetCategories } = useBudgetCategories();
  const { budgetItems } = useBudgetItems();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { refunds } = useRefunds();
  const { settings } = useSettings();
  const { openVendorDetail } = useUI();

  const issues = detectFinancialIssues({
    vendors, vendorQuotes, contracts, budgetCategories, budgetItems, paymentSchedules, payments, refunds,
    weddingDateTimeISO: weddingDateTimeISO(settings),
    criticalVendorCategories: settings.finance.criticalVendorCategories,
    budgetVarianceWarningPercent: settings.finance.budgetVarianceWarningPercent,
    reconfirmationHoursThreshold: 72,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial data issues</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{issues.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {issues.length === 0 ? (
          <EmptyState title="No data quality issues" description="Vendors, contracts, budget, and payment records all pass the automated checks." />
        ) : (
          <ul className="divide-y divide-line-soft max-h-[36rem] overflow-y-auto">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => issue.linkType === 'vendor' && openVendorDetail(issue.linkId)}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-surface-subtle disabled:cursor-default disabled:hover:bg-transparent"
                  disabled={issue.linkType !== 'vendor'}
                >
                  <TriangleAlert className="size-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
                  <span className="text-sm text-ink">{issue.message}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
