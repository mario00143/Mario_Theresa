import { ReportTablePanel } from './ReportTablePanel';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { churchRequirementsCsvFilename, churchRequirementsToCSV } from '@/data/repositories/weddingPrepCsv';

export function ChurchRequirementsReportPanel() {
  const { churchRequirements } = useChurchRequirements();

  const headers = ['Title', 'Category', 'Applicability', 'Owner', 'Due Date', 'Status', 'Document', 'Notes'];
  const rows = churchRequirements.map((r) => [
    r.title,
    r.category,
    r.applicability,
    r.owner ?? '',
    r.dueDate ?? '',
    r.status,
    r.documentRequired ? (r.documentName || 'Required') : 'Not required',
    r.notes ?? '',
  ]);

  return (
    <ReportTablePanel
      title="Church requirements"
      headers={headers}
      rows={rows}
      csvFilename={churchRequirementsCsvFilename()}
      csvContent={churchRequirementsToCSV(churchRequirements)}
      emptyTitle="No church requirements yet"
      emptyDescription="Add requirements from the Church tab."
    />
  );
}
