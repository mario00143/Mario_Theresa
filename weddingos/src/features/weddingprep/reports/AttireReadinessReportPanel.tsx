import { ReportTablePanel } from './ReportTablePanel';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useAttireItems } from '@/hooks/useAttireItems';
import { attireReadinessCsvFilename, attireReadinessToCSV } from '@/data/repositories/weddingPrepCsv';
import { isAttireReady } from '@/utils/attireLogic';

export function AttireReadinessReportPanel() {
  const { attireProfiles } = useAttireProfiles();
  const { attireItems } = useAttireItems();

  const headers = ['Person Role', 'Outfit Type', 'Status', 'Ready', 'Final Fitting Date', 'Items Ready'];
  const rows = attireProfiles.map((p) => {
    const items = attireItems.filter((i) => i.attireProfileId === p.id);
    const ready = items.filter((i) => i.status === 'Ready' || i.status === 'Packed').length;
    return [p.personRole, p.outfitType, p.status, isAttireReady(p) ? 'Yes' : 'No', p.finalFittingDate ?? '', `${ready}/${items.length}`];
  });

  return (
    <ReportTablePanel
      title="Attire readiness"
      headers={headers}
      rows={rows}
      csvFilename={attireReadinessCsvFilename()}
      csvContent={attireReadinessToCSV(attireProfiles, attireItems)}
      emptyTitle="No attire profiles yet"
      emptyDescription="Add attire profiles from the Attire tab."
    />
  );
}
