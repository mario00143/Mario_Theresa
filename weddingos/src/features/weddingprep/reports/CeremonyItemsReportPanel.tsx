import { ReportTablePanel } from './ReportTablePanel';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { ceremonyItemsCsvFilename, ceremonyItemsToCSV } from '@/data/repositories/weddingPrepCsv';

export function CeremonyItemsReportPanel() {
  const { ceremonyItems } = useCeremonyItems();

  const headers = ['Name', 'Category', 'Applicability', 'Custodian', 'Storage Location', 'Status', 'Verification'];
  const rows = ceremonyItems.map((i) => [i.name, i.category, i.applicability, i.custodian ?? '', i.storageLocation ?? '', i.status, i.verificationStatus]);

  return (
    <ReportTablePanel
      title="Ceremony items"
      headers={headers}
      rows={rows}
      csvFilename={ceremonyItemsCsvFilename()}
      csvContent={ceremonyItemsToCSV(ceremonyItems)}
      emptyTitle="No ceremony items yet"
      emptyDescription="Add items from the Ceremony Items tab."
    />
  );
}
