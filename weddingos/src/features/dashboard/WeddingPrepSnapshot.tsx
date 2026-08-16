import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
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
import { useGuests } from '@/hooks/useGuests';
import { useSettings } from '@/hooks/useSettings';
import {
  computeAttireReadiness,
  computeCateringReadiness,
  computeCeremonyReadiness,
  computeChurchReadiness,
  computeDecorReadiness,
  computeGiftsKitsReadiness,
  computeMusicAVReadiness,
  computeOverallReadiness,
  computePhotographyReadiness,
} from '@/utils/weddingPrepReadiness';
import { detectWeddingPrepIssues } from '@/utils/weddingPrepDataQuality';
import { getParishConfirmationQueue } from '@/utils/churchLogic';
import { computeSuggestedCateringCounts } from '@/utils/cateringLogic';
import { weddingDateTimeISO } from '@/utils/date';

export function WeddingPrepSnapshot() {
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
  const { guests } = useGuests();
  const { settings } = useSettings();

  const church = churchProfiles[0];
  const weddingDateTime = weddingDateTimeISO(settings);

  const overall = computeOverallReadiness(
    {
      church: computeChurchReadiness(church, churchRequirements),
      ceremony: computeCeremonyReadiness(ceremonyParticipants, sequenceItems, ceremonyItems),
      catering: computeCateringReadiness(cateringPlans, menuItems),
      decor: computeDecorReadiness(decorPlans, decorDeliverables),
      attire: computeAttireReadiness(attireProfiles, attireItems, groomingAppointments),
      photography: computePhotographyReadiness(photographyPlans, photoGroups),
      musicAV: computeMusicAVReadiness(musicAVPlans, musicCues),
      giftsKits: computeGiftsKitsReadiness(giftPlans, welcomeKits),
    },
    settings.weddingPrep.sectionWeights,
  );

  const suggested = computeSuggestedCateringCounts(guests, 'Wedding');
  const issues = detectWeddingPrepIssues({
    churchProfile: church,
    churchRequirements,
    ceremonyParticipants,
    ceremonyItems,
    cateringPlans,
    menuItems,
    decorPlans,
    attireProfiles,
    attireItems,
    photographyPlans,
    photoGroups,
    musicCues,
    musicAVPlans,
    giftPlans,
    welcomeKits,
    weddingDateTimeISO: weddingDateTime,
    confirmedWeddingAttendance: suggested.confirmedAttendees,
    favorBuffer: 10,
  });

  const parishQueue = getParishConfirmationQueue(churchRequirements);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wedding prep snapshot</CardTitle>
        <Link to="/wedding-prep" className="text-xs font-medium text-brand-700 hover:underline">
          View Wedding Prep
        </Link>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Overall readiness" value={`${overall.percent}% ${overall.level}`} tone={overall.level === 'Ready' ? 'success' : overall.level === 'Not Ready' ? 'critical' : 'warning'} />
        <StatTile label="Pending parish confirmations" value={parishQueue.length} tone={parishQueue.length > 0 ? 'warning' : 'default'} />
        <StatTile label="Data issues" value={issues.length} tone={issues.length > 0 ? 'warning' : 'default'} />
      </CardBody>
    </Card>
  );
}
