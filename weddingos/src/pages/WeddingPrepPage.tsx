import { Route, Routes } from 'react-router-dom';
import { WeddingPrepNav } from '@/features/weddingprep/WeddingPrepNav';
import { WeddingPrepOverviewView } from '@/features/weddingprep/WeddingPrepOverviewView';
import { ChurchView } from '@/features/weddingprep/ChurchView';
import { CeremonyView } from '@/features/weddingprep/CeremonyView';
import { CeremonyItemsView } from '@/features/weddingprep/CeremonyItemsView';
import { CateringView } from '@/features/weddingprep/CateringView';
import { DecorView } from '@/features/weddingprep/DecorView';
import { AttireView } from '@/features/weddingprep/AttireView';
import { PhotoVideoView } from '@/features/weddingprep/PhotoVideoView';
import { MusicAVView } from '@/features/weddingprep/MusicAVView';
import { GiftsKitsView } from '@/features/weddingprep/GiftsKitsView';
import { ReadinessView } from '@/features/weddingprep/ReadinessView';
import { WeddingPrepReportsView } from '@/features/weddingprep/WeddingPrepReportsView';

export function WeddingPrepPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Wedding Prep</h1>
        <p className="text-sm text-ink-faint mt-0.5">
          Church requirements, ceremony planning, catering, décor, attire, photography, music, and gifts — connected end to end.
        </p>
      </div>
      <WeddingPrepNav />
      <Routes>
        <Route index element={<WeddingPrepOverviewView />} />
        <Route path="church" element={<ChurchView />} />
        <Route path="ceremony" element={<CeremonyView />} />
        <Route path="ceremony-items" element={<CeremonyItemsView />} />
        <Route path="catering" element={<CateringView />} />
        <Route path="decor" element={<DecorView />} />
        <Route path="attire" element={<AttireView />} />
        <Route path="photo-video" element={<PhotoVideoView />} />
        <Route path="music-av" element={<MusicAVView />} />
        <Route path="gifts-kits" element={<GiftsKitsView />} />
        <Route path="readiness" element={<ReadinessView />} />
        <Route path="reports" element={<WeddingPrepReportsView />} />
      </Routes>
    </div>
  );
}
