import { ReportTablePanel } from './ReportTablePanel';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { ceremonyParticipantsCsvFilename, ceremonyParticipantsToCSV } from '@/data/repositories/weddingPrepCsv';

export function CeremonyParticipantsReportPanel() {
  const { ceremonyParticipants } = useCeremonyParticipants();

  const headers = ['Role', 'Name', 'Side', 'Confirmed', 'Phone', 'Rehearsal Required', 'Rehearsal Confirmed'];
  const rows = ceremonyParticipants.map((p) => [
    p.role,
    p.name,
    p.side ?? '',
    p.confirmed ? 'Yes' : 'No',
    p.phone ?? '',
    p.rehearsalRequired ? 'Yes' : 'No',
    p.rehearsalConfirmed ? 'Yes' : 'No',
  ]);

  return (
    <ReportTablePanel
      title="Ceremony participants"
      headers={headers}
      rows={rows}
      csvFilename={ceremonyParticipantsCsvFilename()}
      csvContent={ceremonyParticipantsToCSV(ceremonyParticipants)}
      emptyTitle="No ceremony participants yet"
      emptyDescription="Add participants from the Ceremony tab."
    />
  );
}
