import { ReportTablePanel } from './ReportTablePanel';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { giftsFavorsCsvFilename, giftsFavorsToCSV } from '@/data/repositories/weddingPrepCsv';

export function GiftsFavorsReportPanel() {
  const { giftPlans } = useGiftPlans();

  const headers = ['Recipient Type', 'Recipient Name', 'Gift Type', 'Quantity', 'Status', 'Custodian', 'Distribution Owner'];
  const rows = giftPlans.map((p) => [p.recipientType, p.recipientName ?? '', p.giftType, p.quantity, p.status, p.custodian ?? '', p.distributionOwner ?? '']);

  return (
    <ReportTablePanel
      title="Gifts & favors"
      headers={headers}
      rows={rows}
      csvFilename={giftsFavorsCsvFilename()}
      csvContent={giftsFavorsToCSV(giftPlans)}
      emptyTitle="No gift plans yet"
      emptyDescription="Add gift plans from the Gifts & Kits tab."
    />
  );
}
