import { ReportTablePanel } from './ReportTablePanel';
import { useMenuItems } from '@/hooks/useMenuItems';
import { menuCsvFilename, menuToCSV } from '@/data/repositories/weddingPrepCsv';

export function MenuReportPanel() {
  const { menuItems } = useMenuItems();

  const headers = ['Course', 'Name', 'Dietary Type', 'Allergens', 'Live Counter', 'Approved', 'Tasting Status'];
  const rows = menuItems.map((m) => [m.course, m.name, m.dietaryType, m.allergens ?? '', m.liveCounter ? 'Yes' : 'No', m.approved ? 'Yes' : 'No', m.tastingStatus]);

  return (
    <ReportTablePanel
      title="Menu"
      headers={headers}
      rows={rows}
      csvFilename={menuCsvFilename()}
      csvContent={menuToCSV(menuItems)}
      emptyTitle="No menu items yet"
      emptyDescription="Add menu items from the Catering tab."
    />
  );
}
