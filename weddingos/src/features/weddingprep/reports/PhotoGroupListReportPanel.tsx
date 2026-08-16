import { ReportTablePanel } from './ReportTablePanel';
import { usePhotoGroups } from '@/hooks/usePhotoGroups';
import { photoGroupListCsvFilename, photoGroupListToCSV } from '@/data/repositories/weddingPrepCsv';

export function PhotoGroupListReportPanel() {
  const { photoGroups } = usePhotoGroups();

  const headers = ['Sequence', 'Group Name', 'Priority', 'Coordinator', 'Location', 'Completed'];
  const rows = photoGroups.map((g) => [g.sequenceOrder, g.groupName, g.priority, g.coordinator ?? '', g.location ?? '', g.completed ? 'Yes' : 'No']);

  return (
    <ReportTablePanel
      title="Photo group list"
      headers={headers}
      rows={rows}
      csvFilename={photoGroupListCsvFilename()}
      csvContent={photoGroupListToCSV(photoGroups)}
      emptyTitle="No photo groups yet"
      emptyDescription="Add photo groups from the Photo & Video tab."
    />
  );
}
