import { ReportTablePanel } from './ReportTablePanel';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useCeremonySequence } from '@/hooks/useCeremonySequence';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useDecorDeliverables } from '@/hooks/useDecorDeliverables';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useAttireItems } from '@/hooks/useAttireItems';
import { useGroomingAppointments } from '@/hooks/useGroomingAppointments';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { usePhotoGroups } from '@/hooks/usePhotoGroups';
import { useMusicCues } from '@/hooks/useMusicCues';
import { useMusicAVPlans } from '@/hooks/useMusicAVPlans';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useWelcomeKits } from '@/hooks/useWelcomeKits';
import {
  computeAttireReadiness,
  computeCateringReadiness,
  computeCeremonyReadiness,
  computeChurchReadiness,
  computeDecorReadiness,
  computeGiftsKitsReadiness,
  computeMusicAVReadiness,
  computePhotographyReadiness,
} from '@/utils/weddingPrepReadiness';
import { weddingPrepReadinessCsvFilename, weddingPrepReadinessToCSV } from '@/data/repositories/weddingPrepCsv';

export function WeddingPrepReadinessReportPanel() {
  const { churchProfiles } = useChurchProfiles();
  const { churchRequirements } = useChurchRequirements();
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { sequenceItems } = useCeremonySequence();
  const { ceremonyItems } = useCeremonyItems();
  const { cateringPlans } = useCateringPlans();
  const { menuItems } = useMenuItems();
  const { decorPlans } = useDecorPlans();
  const { decorDeliverables } = useDecorDeliverables();
  const { attireProfiles } = useAttireProfiles();
  const { attireItems } = useAttireItems();
  const { groomingAppointments } = useGroomingAppointments();
  const { photographyPlans } = usePhotographyPlans();
  const { photoGroups } = usePhotoGroups();
  const { musicCues } = useMusicCues();
  const { musicAVPlans } = useMusicAVPlans();
  const { giftPlans } = useGiftPlans();
  const { welcomeKits } = useWelcomeKits();

  const sections = {
    Church: computeChurchReadiness(churchProfiles[0], churchRequirements),
    Ceremony: computeCeremonyReadiness(ceremonyParticipants, sequenceItems, ceremonyItems),
    Catering: computeCateringReadiness(cateringPlans, menuItems),
    'Décor': computeDecorReadiness(decorPlans, decorDeliverables),
    Attire: computeAttireReadiness(attireProfiles, attireItems, groomingAppointments),
    'Photography & Video': computePhotographyReadiness(photographyPlans, photoGroups),
    'Music & AV': computeMusicAVReadiness(musicAVPlans, musicCues),
    'Gifts & Kits': computeGiftsKitsReadiness(giftPlans, welcomeKits),
  };

  const headers = ['Section', 'Level', 'Ratio', 'Failed Checks'];
  const rows = Object.entries(sections).map(([name, readiness]) => [name, readiness.level, `${Math.round(readiness.ratio * 100)}%`, readiness.reasons.join('; ') || '—']);

  return (
    <ReportTablePanel
      title="Wedding prep readiness"
      headers={headers}
      rows={rows}
      csvFilename={weddingPrepReadinessCsvFilename()}
      csvContent={weddingPrepReadinessToCSV(sections)}
      emptyTitle="No readiness data"
    />
  );
}
