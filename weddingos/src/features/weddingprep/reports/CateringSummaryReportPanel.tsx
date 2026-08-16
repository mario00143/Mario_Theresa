import { ReportTablePanel } from './ReportTablePanel';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { cateringSummaryCsvFilename, cateringSummaryToCSV } from '@/data/repositories/weddingPrepCsv';

export function CateringSummaryReportPanel() {
  const { cateringPlans } = useCateringPlans();

  const headers = ['Event', 'Service Style', 'Guaranteed Count', 'Vegetarian', 'Non-Veg', 'Vegan', 'Jain', 'Child', 'Infant', 'Couple Meal'];
  const rows = cateringPlans.map((p) => [
    p.event,
    p.serviceStyle,
    p.guaranteedCount ?? '',
    p.vegetarianCount ?? '',
    p.nonVegetarianCount ?? '',
    p.veganCount ?? '',
    p.jainCount ?? '',
    p.childCount ?? '',
    p.infantCount ?? '',
    p.coupleMealReserved ? 'Yes' : 'No',
  ]);

  return (
    <ReportTablePanel
      title="Catering summary"
      headers={headers}
      rows={rows}
      csvFilename={cateringSummaryCsvFilename()}
      csvContent={cateringSummaryToCSV(cateringPlans)}
      emptyTitle="No catering plans yet"
      emptyDescription="Add a catering plan from the Catering tab."
    />
  );
}
