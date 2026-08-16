import { Route, Routes } from 'react-router-dom';
import { VendorsNav } from '@/features/vendors/VendorsNav';
import { VendorsOverviewView } from '@/features/vendors/VendorsOverviewView';
import { VendorsListView } from '@/features/vendors/VendorsListView';
import { QuotesView } from '@/features/vendors/QuotesView';
import { ContractsView } from '@/features/vendors/ContractsView';
import { BudgetView } from '@/features/vendors/BudgetView';
import { PaymentsView } from '@/features/vendors/PaymentsView';
import { VendorsReportsView } from '@/features/vendors/VendorsReportsView';

export function VendorsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Vendors & Budget</h1>
        <p className="text-sm text-ink-faint mt-0.5">
          Vendors, quotations, contracts, budget, payments, and refunds — connected end to end.
        </p>
      </div>
      <VendorsNav />
      <Routes>
        <Route index element={<VendorsOverviewView />} />
        <Route path="vendors" element={<VendorsListView />} />
        <Route path="quotes" element={<QuotesView />} />
        <Route path="contracts" element={<ContractsView />} />
        <Route path="budget" element={<BudgetView />} />
        <Route path="payments" element={<PaymentsView />} />
        <Route path="reports" element={<VendorsReportsView />} />
      </Routes>
    </div>
  );
}
