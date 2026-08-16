import { useMemo, useState } from 'react';
import { FileSignature, TriangleAlert } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { ContractStatusBadge } from '@/components/ui/StatusBadge';
import { Select } from '@/components/ui/Field';
import { CONTRACT_STATUSES } from '@/types';
import { useVendors } from '@/hooks/useVendors';
import { useContracts } from '@/hooks/useContracts';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useBudgetItems } from '@/hooks/useBudget';
import { useUI } from '@/context/UIContext';
import { useSettings } from '@/hooks/useSettings';
import { validateContract } from '@/utils/contractLogic';
import { vendorCommittedAmount } from '@/utils/financeStats';

export function ContractsView() {
  const { vendors } = useVendors();
  const { contracts } = useContracts();
  const { vendorQuotes } = useVendorQuotes();
  const { budgetItems } = useBudgetItems();
  const { openVendorDetail } = useUI();
  const { settings } = useSettings();
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors]);

  const rows = useMemo(() => {
    return contracts
      .filter((c) => statusFilter === 'All' || c.status === statusFilter)
      .map((contract) => {
        const vendor = vendorById.get(contract.vendorId);
        const selectedQuote = vendorQuotes.find((q) => q.vendorId === contract.vendorId && q.isSelected);
        const committed = vendorCommittedAmount(contract.vendorId, budgetItems);
        const warnings = validateContract(contract, selectedQuote, committed || undefined, settings.wedding.date, settings.engagement.date);
        return { contract, vendor, warnings };
      })
      .sort((a, b) => (a.vendor?.name ?? '').localeCompare(b.vendor?.name ?? ''));
  }, [contracts, vendorById, vendorQuotes, budgetItems, statusFilter, settings.wedding.date, settings.engagement.date]);

  if (contracts.length === 0) {
    return <EmptyState icon={<FileSignature className="size-8" aria-hidden="true" />} title="No contracts yet" description="Add a contract from a vendor's detail page." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Contracts</h2>
        <Select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto! min-w-[9rem]">
          <option value="All">All statuses</option>
          {CONTRACT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Contract date</th>
                  <th className="px-4 py-3">Service start</th>
                  <th className="px-4 py-3">Final settlement due</th>
                  <th className="px-4 py-3">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ contract, vendor, warnings }) => (
                  <tr
                    key={contract.id}
                    onClick={() => openVendorDetail(contract.vendorId)}
                    className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{contract.contractReference ?? '—'}</td>
                    <td className="px-4 py-3">
                      <ContractStatusBadge status={contract.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{contract.contractDate ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{contract.serviceStartDate ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{contract.finalSettlementDueDate ?? '—'}</td>
                    <td className="px-4 py-3">
                      {warnings.length > 0 ? (
                        <Badge tone="warning" icon={<TriangleAlert className="size-3" aria-hidden="true" />}>
                          {warnings.length}
                        </Badge>
                      ) : (
                        <span className="text-xs text-ink-faint">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {rows.some((r) => r.warnings.length > 0) && (
        <Card>
          <CardBody className="space-y-2">
            <p className="text-sm font-semibold text-ink">Warning details</p>
            {rows
              .filter((r) => r.warnings.length > 0)
              .map(({ contract, vendor, warnings }) => (
                <div key={contract.id} className="space-y-1">
                  <p className="text-xs font-medium text-ink">{vendor?.name ?? contract.id}</p>
                  {warnings.map((w) => (
                    <p key={w.field} className="flex items-start gap-1.5 text-xs text-warning pl-2">
                      <TriangleAlert className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      {w.message}
                    </p>
                  ))}
                </div>
              ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
