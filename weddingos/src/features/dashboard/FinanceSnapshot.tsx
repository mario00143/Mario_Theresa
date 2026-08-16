import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useVendors } from '@/hooks/useVendors';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useContracts } from '@/hooks/useContracts';
import { useBudgetItems } from '@/hooks/useBudget';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useRefunds } from '@/hooks/useRefunds';
import { useSettings } from '@/hooks/useSettings';
import { computeFinanceSnapshot, computeVendorOverview } from '@/utils/financeStats';
import { weddingDateTimeISO } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';

export function FinanceSnapshot() {
  const { vendors } = useVendors();
  const { vendorQuotes } = useVendorQuotes();
  const { contracts } = useContracts();
  const { budgetItems } = useBudgetItems();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { refunds } = useRefunds();
  const { settings } = useSettings();

  const snapshot = computeFinanceSnapshot(budgetItems, payments);
  const vendorStats = computeVendorOverview(
    vendors, vendorQuotes, contracts, paymentSchedules, payments, refunds,
    settings.finance.criticalVendorCategories, weddingDateTimeISO(settings), 72,
  );
  const currency = settings.finance.currency;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance snapshot</CardTitle>
        <Link to="/vendors" className="text-xs font-medium text-brand-700 hover:underline">
          View Vendors & Budget
        </Link>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Committed" value={formatCurrency(snapshot.committed, currency)} />
        <StatTile label="Paid" value={formatCurrency(snapshot.paid, currency)} tone="success" />
        <StatTile label="Outstanding" value={formatCurrency(snapshot.outstanding, currency)} tone={snapshot.outstanding > 0 ? 'warning' : 'default'} />
        <StatTile label="Vendors confirmed" value={vendorStats.confirmed + vendorStats.completed} />
        <StatTile label="Contracts missing" value={vendorStats.contractsMissing} tone={vendorStats.contractsMissing > 0 ? 'critical' : 'default'} />
        <StatTile
          label="Need reconfirmation"
          value={vendorStats.vendorsRequiringReconfirmation}
          tone={vendorStats.vendorsRequiringReconfirmation > 0 ? 'critical' : 'default'}
        />
      </CardBody>
    </Card>
  );
}
