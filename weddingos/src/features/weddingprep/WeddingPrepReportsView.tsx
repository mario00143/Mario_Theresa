import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ChurchRequirementsReportPanel } from './reports/ChurchRequirementsReportPanel';
import { CeremonyParticipantsReportPanel } from './reports/CeremonyParticipantsReportPanel';
import { CeremonyItemsReportPanel } from './reports/CeremonyItemsReportPanel';
import { CateringSummaryReportPanel } from './reports/CateringSummaryReportPanel';
import { MenuReportPanel } from './reports/MenuReportPanel';
import { DecorPlansReportPanel } from './reports/DecorPlansReportPanel';
import { AttireReadinessReportPanel } from './reports/AttireReadinessReportPanel';
import { PhotoGroupListReportPanel } from './reports/PhotoGroupListReportPanel';
import { MusicCueSheetReportPanel } from './reports/MusicCueSheetReportPanel';
import { GiftsFavorsReportPanel } from './reports/GiftsFavorsReportPanel';
import { WeddingPrepReadinessReportPanel } from './reports/WeddingPrepReadinessReportPanel';
import { WeddingPrepDataIssuesPanel } from './reports/WeddingPrepDataIssuesPanel';

const TABS = [
  { key: 'church', label: 'Church Requirements', Component: ChurchRequirementsReportPanel },
  { key: 'participants', label: 'Ceremony Participants', Component: CeremonyParticipantsReportPanel },
  { key: 'items', label: 'Ceremony Items', Component: CeremonyItemsReportPanel },
  { key: 'catering', label: 'Catering Summary', Component: CateringSummaryReportPanel },
  { key: 'menu', label: 'Menu', Component: MenuReportPanel },
  { key: 'decor', label: 'Décor Plans', Component: DecorPlansReportPanel },
  { key: 'attire', label: 'Attire Readiness', Component: AttireReadinessReportPanel },
  { key: 'photo', label: 'Photo Group List', Component: PhotoGroupListReportPanel },
  { key: 'music', label: 'Music Cue Sheet', Component: MusicCueSheetReportPanel },
  { key: 'gifts', label: 'Gifts & Favors', Component: GiftsFavorsReportPanel },
  { key: 'readiness', label: 'Readiness', Component: WeddingPrepReadinessReportPanel },
  { key: 'issues', label: 'Data Issues', Component: WeddingPrepDataIssuesPanel },
] as const;

export function WeddingPrepReportsView() {
  const [active, setActive] = useState<(typeof TABS)[number]['key']>('church');
  const ActivePanel = TABS.find((t) => t.key === active)?.Component ?? ChurchRequirementsReportPanel;

  return (
    <div className="space-y-4">
      <nav aria-label="Wedding prep report sections" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
              active === tab.key ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-faint hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <ActivePanel />
    </div>
  );
}
