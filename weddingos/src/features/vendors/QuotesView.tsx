import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { QuoteStatusBadge } from '@/components/ui/StatusBadge';
import { Select } from '@/components/ui/Field';
import { useVendors } from '@/hooks/useVendors';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useUI } from '@/context/UIContext';
import { buildQuoteComparison } from '@/utils/quoteLogic';
import { isQuoteExpired, isQuoteExpiringSoon } from '@/utils/quoteLogic';
import { formatCurrency } from '@/utils/currency';

export function QuotesView() {
  const { vendors } = useVendors();
  const { vendorQuotes } = useVendorQuotes();
  const { openVendorDetail } = useUI();
  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors]);

  const categoriesWithQuotes = useMemo(() => {
    const cats = new Set<string>();
    for (const quote of vendorQuotes) {
      const vendor = vendorById.get(quote.vendorId);
      if (vendor) cats.add(vendor.category);
    }
    return Array.from(cats).sort();
  }, [vendorQuotes, vendorById]);

  const [category, setCategory] = useState<string>('');
  const effectiveCategory = category || categoriesWithQuotes[0] || '';

  const comparisonRows = useMemo(() => {
    if (!effectiveCategory) return [];
    const quotesInCategory = vendorQuotes.filter((q) => vendorById.get(q.vendorId)?.category === effectiveCategory);
    return buildQuoteComparison(quotesInCategory);
  }, [vendorQuotes, vendorById, effectiveCategory]);

  const sortedQuotes = useMemo(() => [...vendorQuotes].sort((a, b) => (a.quoteDate ?? '').localeCompare(b.quoteDate ?? '')).reverse(), [vendorQuotes]);

  if (vendorQuotes.length === 0) {
    return <EmptyState icon={<FileText className="size-8" aria-hidden="true" />} title="No quotes yet" description="Add quotes from a vendor's detail page." />;
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Compare quotes by category</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Select aria-label="Category to compare" value={effectiveCategory} onChange={(e) => setCategory(e.target.value)} className="w-auto! min-w-[12rem]">
            {categoriesWithQuotes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {comparisonRows.length === 0 ? (
            <p className="text-sm text-ink-faint">No quotes in this category.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Effective amount</th>
                    <th className="px-4 py-3">Valid until</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows
                    .sort((a, b) => a.effectiveAmount - b.effectiveAmount)
                    .map(({ quote, effectiveAmount, isLowest }) => {
                      const vendor = vendorById.get(quote.vendorId);
                      return (
                        <tr
                          key={quote.id}
                          onClick={() => openVendorDetail(quote.vendorId)}
                          className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                        >
                          <td className="px-4 py-3 font-medium text-ink">{vendor?.name ?? '—'}</td>
                          <td className="px-4 py-3">
                            <QuoteStatusBadge status={quote.status} />
                          </td>
                          <td className="px-4 py-3 tabular-nums text-ink">{formatCurrency(effectiveAmount, quote.currency)}</td>
                          <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{quote.validUntil ?? '—'}</td>
                          <td className="px-4 py-3">
                            {isLowest && <Badge tone="info">Lowest price</Badge>}
                            {quote.isSelected && <Badge tone="success">Selected</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-ink-faint">Lowest price is shown as a fact only — it is not a recommendation. Weigh scope, reliability, and readiness too.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All quotes</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Total amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {sortedQuotes.map((quote) => {
                  const vendor = vendorById.get(quote.vendorId);
                  const expired = isQuoteExpired(quote);
                  const expiringSoon = !expired && isQuoteExpiringSoon(quote);
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => openVendorDetail(quote.vendorId)}
                      className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                    >
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{vendor?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{vendor?.category ?? '—'}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{quote.quoteReference ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums text-ink whitespace-nowrap">{formatCurrency(quote.totalAmount, quote.currency)}</td>
                      <td className="px-4 py-3">
                        <QuoteStatusBadge status={quote.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {quote.isSelected && <Badge tone="success">Selected</Badge>}
                          {expired && <Badge tone="danger">Expired</Badge>}
                          {expiringSoon && <Badge tone="warning">Expiring soon</Badge>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
