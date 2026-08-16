import { useState } from 'react';
import { cn } from '@/lib/cn';
import { BudgetVsForecastReportPanel } from './reports/BudgetVsForecastReportPanel';
import { BudgetVsActualReportPanel } from './reports/BudgetVsActualReportPanel';
import { VendorCommitmentReportPanel } from './reports/VendorCommitmentReportPanel';
import { PaymentDueReportPanel } from './reports/PaymentDueReportPanel';
import { PaymentHistoryReportPanel } from './reports/PaymentHistoryReportPanel';
import { RefundReportPanel } from './reports/RefundReportPanel';
import { UnapprovedCommitmentsReportPanel } from './reports/UnapprovedCommitmentsReportPanel';
import { VendorReadinessReportPanel } from './reports/VendorReadinessReportPanel';
import { FinancialDataIssuesPanel } from './reports/FinancialDataIssuesPanel';

const TABS = [
  { key: 'budget-forecast', label: 'Budget vs. Forecast', Component: BudgetVsForecastReportPanel },
  { key: 'budget-actual', label: 'Budget vs. Actual', Component: BudgetVsActualReportPanel },
  { key: 'vendor-commitment', label: 'Vendor Commitments', Component: VendorCommitmentReportPanel },
  { key: 'payment-due', label: 'Payment Due', Component: PaymentDueReportPanel },
  { key: 'payment-history', label: 'Payment History', Component: PaymentHistoryReportPanel },
  { key: 'refunds', label: 'Refunds', Component: RefundReportPanel },
  { key: 'unapproved', label: 'Unapproved Commitments', Component: UnapprovedCommitmentsReportPanel },
  { key: 'readiness', label: 'Vendor Readiness', Component: VendorReadinessReportPanel },
  { key: 'data-issues', label: 'Data Issues', Component: FinancialDataIssuesPanel },
] as const;

export function VendorsReportsView() {
  const [active, setActive] = useState<(typeof TABS)[number]['key']>('budget-forecast');
  const ActivePanel = TABS.find((t) => t.key === active)?.Component ?? BudgetVsForecastReportPanel;

  return (
    <div className="space-y-4">
      <nav aria-label="Financial report sections" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
              active === tab.key ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-faint hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <ActivePanel />
    </div>
  );
}
