import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useVendors } from '@/hooks/useVendors';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useContracts } from '@/hooks/useContracts';
import { useBudgetCategories, useBudgetItems } from '@/hooks/useBudget';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useRefunds } from '@/hooks/useRefunds';
import { useSettings } from '@/hooks/useSettings';
import { computeBudgetOverview } from '@/utils/budgetLogic';
import { computeFinanceSnapshot, computeVendorOverview } from '@/utils/financeStats';
import { detectFinancialIssues } from '@/utils/financialDataQuality';
import { weddingDateTimeISO } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';

export function VendorsOverviewView() {
  const { vendors } = useVendors();
  const { vendorQuotes } = useVendorQuotes();
  const { contracts } = useContracts();
  const { budgetCategories } = useBudgetCategories();
  const { budgetItems } = useBudgetItems();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { refunds } = useRefunds();
  const { settings } = useSettings();

  const weddingDateTime = weddingDateTimeISO(settings);
  const budget = computeBudgetOverview(budgetCategories, budgetItems, settings.finance.budgetVarianceWarningPercent);
  const snapshot = computeFinanceSnapshot(budgetItems, payments);
  const vendorStats = computeVendorOverview(
    vendors, vendorQuotes, contracts, paymentSchedules, payments, refunds,
    settings.finance.criticalVendorCategories, weddingDateTime, 72,
  );
  const issues = detectFinancialIssues({
    vendors, vendorQuotes, contracts, budgetCategories, budgetItems, paymentSchedules, payments, refunds,
    weddingDateTimeISO: weddingDateTime,
    criticalVendorCategories: settings.finance.criticalVendorCategories,
    budgetVarianceWarningPercent: settings.finance.budgetVarianceWarningPercent,
    reconfirmationHoursThreshold: 72,
  });
  const currency = settings.finance.currency;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Original budget" value={formatCurrency(budget.originalBudget, currency)} />
          <StatTile label="Latest forecast" value={formatCurrency(budget.latestForecast, currency)} />
          <StatTile
            label="Variance"
            value={formatCurrency(budget.variance, currency)}
            tone={budget.variance > 0 ? 'warning' : 'success'}
            hint={`${budget.variancePercent >= 0 ? '+' : ''}${budget.variancePercent.toFixed(1)}%`}
          />
          <StatTile label="Contingency remaining" value={formatCurrency(budget.contingencyRemaining, currency)} />
          <StatTile label="Committed" value={formatCurrency(snapshot.committed, currency)} />
          <StatTile label="Paid" value={formatCurrency(snapshot.paid, currency)} tone="success" />
          <StatTile label="Outstanding" value={formatCurrency(snapshot.outstanding, currency)} tone={snapshot.outstanding > 0 ? 'warning' : 'default'} />
          <StatTile
            label="Unapproved committed"
            value={formatCurrency(budget.unapprovedCommitted, currency)}
            tone={budget.unapprovedCommitted > 0 ? 'critical' : 'default'}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Selected" value={vendorStats.selected} />
          <StatTile label="Contracted" value={vendorStats.contracted} />
          <StatTile label="Confirmed" value={vendorStats.confirmed} tone="success" />
          <StatTile label="Completed" value={vendorStats.completed} tone="success" />
          <StatTile label="Contracts missing" value={vendorStats.contractsMissing} tone={vendorStats.contractsMissing > 0 ? 'critical' : 'default'} />
          <StatTile label="Quotes expiring soon" value={vendorStats.quotesExpiringSoon} tone={vendorStats.quotesExpiringSoon > 0 ? 'warning' : 'default'} />
          <StatTile
            label="Need reconfirmation"
            value={vendorStats.vendorsRequiringReconfirmation}
            tone={vendorStats.vendorsRequiringReconfirmation > 0 ? 'critical' : 'default'}
          />
          <StatTile
            label="Overdue payments"
            value={vendorStats.vendorsWithOverduePayment}
            tone={vendorStats.vendorsWithOverduePayment > 0 ? 'critical' : 'default'}
          />
        </CardBody>
      </Card>

      <Link to="/vendors/reports" className="block">
        <Card className={issues.length > 0 ? 'border-warning/40' : undefined}>
          <CardBody className="flex items-center gap-3">
            <TriangleAlert className={`size-5 shrink-0 ${issues.length > 0 ? 'text-warning' : 'text-ink-faint'}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">Financial data issues</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {issues.length === 0 ? 'No data quality issues found.' : `${issues.length} issue${issues.length === 1 ? '' : 's'} to review — see Reports.`}
              </p>
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
