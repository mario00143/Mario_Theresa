import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useBudgetCategories, useBudgetItems } from '@/hooks/useBudget';
import { useSettings } from '@/hooks/useSettings';
import { buildBudgetVsForecastReport } from '@/utils/financeReports';
import { formatCurrency } from '@/utils/currency';

export function BudgetVsForecastReportPanel() {
  const { budgetCategories } = useBudgetCategories();
  const { budgetItems } = useBudgetItems();
  const { settings } = useSettings();
  const currency = settings.finance.currency;

  const rows = buildBudgetVsForecastReport(budgetCategories, budgetItems, settings.finance.budgetVarianceWarningPercent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. forecast</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No budget categories yet" description="Add categories from the Budget tab." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Original budget</th>
                  <th className="px-4 py-3">Latest forecast</th>
                  <th className="px-4 py-3">Variance</th>
                  <th className="px-4 py-3">Variance %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.category.id} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{row.category.name}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.originalBudget, currency)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.latestForecast, currency)}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{formatCurrency(row.variance, currency)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone={row.variancePercent >= settings.finance.budgetVarianceWarningPercent ? 'warning' : 'neutral'}>
                        {row.variancePercent.toFixed(1)}%
                      </Badge>
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
