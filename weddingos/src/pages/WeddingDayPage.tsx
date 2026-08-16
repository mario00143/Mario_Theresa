import { Link, Route, Routes } from 'react-router-dom';
import { WeddingDayNav } from '@/features/weddingday/WeddingDayNav';
import { CommandCenterView } from '@/features/weddingday/CommandCenterView';
import { RunSheetView } from '@/features/weddingday/RunSheetView';
import { IssuesView } from '@/features/weddingday/IssuesView';
import { DutiesView } from '@/features/weddingday/DutiesView';
import { ManifestsView } from '@/features/weddingday/ManifestsView';
import { CeremonyItemsDayOfView } from '@/features/weddingday/CeremonyItemsDayOfView';
import { VendorDayView } from '@/features/weddingday/VendorDayView';
import { EmergencyView } from '@/features/weddingday/EmergencyView';
import { CloseoutView } from '@/features/weddingday/CloseoutView';
import { CommandSheetView } from '@/features/weddingday/CommandSheetView';
import { OfflinePackView } from '@/features/weddingday/OfflinePackView';
import { useWeddingDayRealtime } from '@/hooks/useWeddingDayRealtime';

export function WeddingDayPage() {
  useWeddingDayRealtime();
  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Wedding Day</h1>
          <p className="text-sm text-ink-faint mt-0.5">
            The live operational control center for the wedding day — what's happening now, who owns it, and what needs attention.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link to="/wedding-day/command-sheet" className="rounded-lg border border-line px-3 py-1.5 text-ink-soft hover:bg-surface-subtle">
            Command Sheet
          </Link>
          <Link to="/wedding-day/offline-pack" className="rounded-lg border border-line px-3 py-1.5 text-ink-soft hover:bg-surface-subtle">
            Offline Pack
          </Link>
        </div>
      </div>
      <div className="no-print">
        <WeddingDayNav />
      </div>
      <Routes>
        <Route index element={<CommandCenterView />} />
        <Route path="run-sheet" element={<RunSheetView />} />
        <Route path="issues" element={<IssuesView />} />
        <Route path="duties" element={<DutiesView />} />
        <Route path="manifests" element={<ManifestsView />} />
        <Route path="ceremony-items" element={<CeremonyItemsDayOfView />} />
        <Route path="vendors" element={<VendorDayView />} />
        <Route path="emergency" element={<EmergencyView />} />
        <Route path="closeout" element={<CloseoutView />} />
        <Route path="command-sheet" element={<CommandSheetView />} />
        <Route path="offline-pack" element={<OfflinePackView />} />
      </Routes>
    </div>
  );
}
