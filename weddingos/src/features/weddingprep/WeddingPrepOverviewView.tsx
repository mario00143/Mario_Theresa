import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
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
  type SectionReadiness,
  type WeddingPrepReadinessLevel,
} from '@/utils/weddingPrepReadiness';
import { detectWeddingPrepIssues } from '@/utils/weddingPrepDataQuality';
import { getParishConfirmationQueue } from '@/utils/churchLogic';
import { computeSuggestedCateringCounts } from '@/utils/cateringLogic';
import { weddingDateTimeISO, daysUntil } from '@/utils/date';

const READINESS_TONE: Record<WeddingPrepReadinessLevel, 'success' | 'warning' | 'critical' | 'default'> = {
  Ready: 'success',
  'Mostly Ready': 'default',
  'At Risk': 'warning',
  'Not Ready': 'critical',
};

const READINESS_BADGE_TONE: Record<WeddingPrepReadinessLevel, BadgeTone> = {
  Ready: 'success',
  'Mostly Ready': 'neutral',
  'At Risk': 'warning',
  'Not Ready': 'critical',
};

function SectionTile({ label, readiness }: { label: string; readiness: SectionReadiness }) {
  return <StatTile label={label} value={readiness.level} tone={READINESS_TONE[readiness.level]} hint={readiness.reasons[0]} />;
}

export function WeddingPrepOverviewView() {
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

  const churchReadiness = computeChurchReadiness(church, churchRequirements);
  const ceremonyReadiness = computeCeremonyReadiness(ceremonyParticipants, sequenceItems, ceremonyItems);
  const cateringReadiness = computeCateringReadiness(cateringPlans, menuItems);
  const decorReadiness = computeDecorReadiness(decorPlans, decorDeliverables);
  const attireReadiness = computeAttireReadiness(attireProfiles, attireItems, groomingAppointments);
  const photographyReadiness = computePhotographyReadiness(photographyPlans, photoGroups);
  const musicReadiness = computeMusicAVReadiness(musicAVPlans, musicCues);
  const giftsReadiness = computeGiftsKitsReadiness(giftPlans, welcomeKits);

  const overall = computeOverallReadiness(
    {
      church: churchReadiness,
      ceremony: ceremonyReadiness,
      catering: cateringReadiness,
      decor: decorReadiness,
      attire: attireReadiness,
      photography: photographyReadiness,
      musicAV: musicReadiness,
      giftsKits: giftsReadiness,
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
  const unconfirmedParticipants = ceremonyParticipants.filter((p) => !p.confirmed).length;
  const unverifiedCriticalItems = ceremonyItems.filter(
    (i) => i.applicability === 'Applicable' && i.verificationStatus !== 'Verified',
  ).length;

  const requirementDueDates = churchRequirements
    .filter((r) => r.applicability === 'Applicable' && r.dueDate)
    .map((r) => daysUntil(r.dueDate, new Date()))
    .filter((d): d is number => d !== null && d >= 0);
  const dueIn7 = requirementDueDates.filter((d) => d <= 7).length;
  const dueIn14 = requirementDueDates.filter((d) => d <= 14).length;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Overall readiness</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-semibold tabular-nums text-ink">{overall.percent}%</p>
            <p className="text-xs text-ink-faint mt-0.5">Weighted across all sections — not a bare number, see breakdown below.</p>
          </div>
          <Badge tone={READINESS_BADGE_TONE[overall.level]}>{overall.level}</Badge>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section readiness</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SectionTile label="Church" readiness={churchReadiness} />
          <SectionTile label="Ceremony" readiness={ceremonyReadiness} />
          <SectionTile label="Catering" readiness={cateringReadiness} />
          <SectionTile label="Décor" readiness={decorReadiness} />
          <SectionTile label="Attire" readiness={attireReadiness} />
          <SectionTile label="Photo/Video" readiness={photographyReadiness} />
          <SectionTile label="Music/AV" readiness={musicReadiness} />
          <SectionTile label="Gifts/Kits" readiness={giftsReadiness} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attention</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Due in 7 days" value={dueIn7} tone={dueIn7 > 0 ? 'critical' : 'default'} />
          <StatTile label="Due in 14 days" value={dueIn14} tone={dueIn14 > 0 ? 'warning' : 'default'} />
          <StatTile label="Pending parish confirmations" value={parishQueue.length} tone={parishQueue.length > 0 ? 'warning' : 'default'} />
          <StatTile label="Participants not confirmed" value={unconfirmedParticipants} tone={unconfirmedParticipants > 0 ? 'warning' : 'default'} />
          <StatTile label="Unverified ceremony items" value={unverifiedCriticalItems} tone={unverifiedCriticalItems > 0 ? 'warning' : 'default'} />
        </CardBody>
      </Card>

      <Link to="/wedding-prep/reports" className="block">
        <Card className={issues.length > 0 ? 'border-warning/40' : undefined}>
          <CardBody className="flex items-center gap-3">
            <TriangleAlert className={`size-5 shrink-0 ${issues.length > 0 ? 'text-warning' : 'text-ink-faint'}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">Wedding prep data issues</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {issues.length === 0 ? 'No data quality issues found.' : `${issues.length} issue${issues.length === 1 ? '' : 's'} to review — see Reports.`}
              </p>
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
