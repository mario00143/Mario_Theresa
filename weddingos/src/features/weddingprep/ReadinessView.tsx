import { Check, X } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
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

const READINESS_BADGE_TONE: Record<WeddingPrepReadinessLevel, BadgeTone> = {
  Ready: 'success',
  'Mostly Ready': 'neutral',
  'At Risk': 'warning',
  'Not Ready': 'critical',
};

function SectionReadinessCard({ title, readiness }: { title: string; readiness: SectionReadiness }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-faint tabular-nums">{Math.round(readiness.ratio * 100)}%</span>
          <Badge tone={READINESS_BADGE_TONE[readiness.level]}>{readiness.level}</Badge>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="divide-y divide-line-soft">
          {readiness.checks.map((check) => (
            <li key={check.label} className="flex items-start gap-2 px-4 py-2">
              {check.passed ? (
                <Check className="size-4 shrink-0 mt-0.5 text-success" aria-hidden="true" />
              ) : (
                <X className="size-4 shrink-0 mt-0.5 text-critical" aria-hidden="true" />
              )}
              <span className={`text-sm ${check.passed ? 'text-ink-soft' : 'text-ink'}`}>{check.label}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function ReadinessView() {
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
  const { settings } = useSettings();

  const church = churchProfiles[0];

  const churchReadiness = computeChurchReadiness(church, churchRequirements);
  const ceremonyReadiness = computeCeremonyReadiness(ceremonyParticipants, sequenceItems, ceremonyItems);
  const cateringReadiness = computeCateringReadiness(cateringPlans, menuItems);
  const decorReadiness = computeDecorReadiness(decorPlans, decorDeliverables);
  const attireReadiness = computeAttireReadiness(attireProfiles, attireItems, groomingAppointments);
  const photographyReadiness = computePhotographyReadiness(photographyPlans, photoGroups);
  const musicReadiness = computeMusicAVReadiness(musicAVPlans, musicCues);
  const giftsReadiness = computeGiftsKitsReadiness(giftPlans, welcomeKits);

  const sections = {
    church: churchReadiness,
    ceremony: ceremonyReadiness,
    catering: cateringReadiness,
    decor: decorReadiness,
    attire: attireReadiness,
    photography: photographyReadiness,
    musicAV: musicReadiness,
    giftsKits: giftsReadiness,
  };

  const overall = computeOverallReadiness(sections, settings.weddingPrep.sectionWeights);

  const totalChecks = Object.values(sections).reduce((sum, s) => sum + s.checks.length, 0);
  const passedChecks = Object.values(sections).reduce((sum, s) => sum + s.checks.filter((c) => c.passed).length, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Overall wedding preparation readiness</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-semibold tabular-nums text-ink">{overall.percent}%</p>
            <p className="text-xs text-ink-faint mt-0.5">
              Weighted across all 8 sections using the configured weights (Church 20, Ceremony 20, Catering 15, Décor 10, Attire 10, Photography 10, Music/AV 5, Gifts/Kits 10).
            </p>
          </div>
          <Badge tone={READINESS_BADGE_TONE[overall.level]}>{overall.level}</Badge>
          <span className="text-xs text-ink-faint">
            {passedChecks} of {totalChecks} preparation checks passed
          </span>
        </CardBody>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-ink mb-2">Wedding preparation checklist</h2>
        <p className="text-xs text-ink-faint mb-3">
          Each check below is computed live from the underlying Church, Ceremony, Catering, Décor, Attire, Photography, Music/AV, and Gifts &amp; Kits records — nothing here is manually
          tracked separately.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionReadinessCard title="Church" readiness={churchReadiness} />
          <SectionReadinessCard title="Ceremony" readiness={ceremonyReadiness} />
          <SectionReadinessCard title="Catering" readiness={cateringReadiness} />
          <SectionReadinessCard title="Décor" readiness={decorReadiness} />
          <SectionReadinessCard title="Attire" readiness={attireReadiness} />
          <SectionReadinessCard title="Photography & Video" readiness={photographyReadiness} />
          <SectionReadinessCard title="Music & AV" readiness={musicReadiness} />
          <SectionReadinessCard title="Gifts & Kits" readiness={giftsReadiness} />
        </div>
      </div>
    </div>
  );
}
