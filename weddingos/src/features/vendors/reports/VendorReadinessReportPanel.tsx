import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { useVendors } from '@/hooks/useVendors';
import { useVendorContacts } from '@/hooks/useVendorContacts';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useContracts } from '@/hooks/useContracts';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useUI } from '@/context/UIContext';
import { buildVendorReadinessReport } from '@/utils/financeReports';
import { vendorReadinessCsvFilename, vendorReadinessToCSV } from '@/data/repositories/financeCsv';
import { downloadTextFile } from '@/utils/download';
import type { ReadinessLevel } from '@/utils/vendorReadiness';

const READINESS_TONE: Record<ReadinessLevel, BadgeTone> = {
  Ready: 'success',
  'Mostly Ready': 'info',
  'At Risk': 'warning',
  'Not Ready': 'critical',
};

export function VendorReadinessReportPanel() {
  const { vendors } = useVendors();
  const { vendorContacts } = useVendorContacts();
  const { vendorQuotes } = useVendorQuotes();
  const { contracts } = useContracts();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { openVendorDetail } = useUI();

  const rows = buildVendorReadinessReport(vendors, vendorContacts, vendorQuotes, contracts, paymentSchedules, payments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor readiness</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">{rows.length}</span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={() =>
              downloadTextFile(
                vendorReadinessCsvFilename(),
                vendorReadinessToCSV(vendors, vendorContacts, vendorQuotes, contracts, paymentSchedules, payments),
                'text/csv',
              )
            }
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No selected, contracted, confirmed, or completed vendors yet" description="Readiness applies once a vendor is Selected or further along." />
        ) : (
          <div className="divide-y divide-line-soft">
            {rows.map((row) => (
              <div
                key={row.vendor.id}
                onClick={() => openVendorDetail(row.vendor.id)}
                className="px-4 py-3 cursor-pointer hover:bg-surface-subtle"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-medium text-ink">{row.vendor.name}</p>
                  <Badge tone={READINESS_TONE[row.readinessLevel]}>{row.readinessLevel}</Badge>
                </div>
                {row.missingItems.length > 0 && (
                  <ul className="mt-1 list-disc list-inside space-y-0.5">
                    {row.missingItems.map((m) => (
                      <li key={m} className="text-xs text-ink-faint">
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
