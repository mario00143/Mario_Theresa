import { ReportTablePanel } from './ReportTablePanel';
import { useMusicCues } from '@/hooks/useMusicCues';
import { musicCueSheetCsvFilename, musicCueSheetToCSV } from '@/data/repositories/weddingPrepCsv';

export function MusicCueSheetReportPanel() {
  const { musicCues } = useMusicCues();

  const headers = ['Sequence', 'Cue Type', 'Title', 'Performer', 'Planned Time', 'Approved', 'Backup Available'];
  const rows = musicCues.map((c) => [c.sequenceOrder, c.cueType, c.title, c.performer ?? '', c.plannedTime ?? '', c.approved ? 'Yes' : 'No', c.backupAvailable ? 'Yes' : 'No']);

  return (
    <ReportTablePanel
      title="Music cue sheet"
      headers={headers}
      rows={rows}
      csvFilename={musicCueSheetCsvFilename()}
      csvContent={musicCueSheetToCSV(musicCues)}
      emptyTitle="No music cues yet"
      emptyDescription="Add music cues from the Music & AV tab."
    />
  );
}
