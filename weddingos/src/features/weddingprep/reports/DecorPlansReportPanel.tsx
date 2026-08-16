import { ReportTablePanel } from './ReportTablePanel';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useDecorDeliverables } from '@/hooks/useDecorDeliverables';
import { useVendors } from '@/hooks/useVendors';
import { decorPlansCsvFilename, decorPlansToCSV } from '@/data/repositories/weddingPrepCsv';

export function DecorPlansReportPanel() {
  const { decorPlans } = useDecorPlans();
  const { decorDeliverables } = useDecorDeliverables();
  const { vendors } = useVendors();
  const vendorById = new Map(vendors.map((v) => [v.id, v]));

  const headers = ['Area', 'Theme', 'Vendor', 'Install Date', 'Approval Status', 'Walkthrough Complete', 'Deliverables'];
  const rows = decorPlans.map((p) => [
    p.area,
    p.theme ?? '',
    p.vendorId ? (vendorById.get(p.vendorId)?.name ?? '') : '',
    p.installDate ?? '',
    p.approvalStatus,
    p.finalWalkthroughComplete ? 'Yes' : 'No',
    decorDeliverables.filter((d) => d.decorPlanId === p.id).length,
  ]);

  return (
    <ReportTablePanel
      title="Décor plans"
      headers={headers}
      rows={rows}
      csvFilename={decorPlansCsvFilename()}
      csvContent={decorPlansToCSV(decorPlans, decorDeliverables, vendors)}
      emptyTitle="No décor plans yet"
      emptyDescription="Add décor plans from the Décor tab."
    />
  );
}
