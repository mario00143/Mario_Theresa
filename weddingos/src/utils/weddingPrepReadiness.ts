import type {
  AttireItem,
  AttireProfile,
  CateringPlan,
  CeremonyItem,
  CeremonyParticipant,
  CeremonySequenceItem,
  ChurchProfile,
  ChurchRequirement,
  DecorDeliverable,
  DecorPlan,
  GiftPlan,
  GroomingAppointment,
  MenuItem,
  MusicAVPlan,
  MusicCue,
  PhotoGroup,
  PhotographyPlan,
  WelcomeKit,
} from '@/types';
import { CHURCH_REQUIREMENT_DONE_STATUSES, DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES, DEFAULT_WEDDING_PREP_SECTION_WEIGHTS, type WeddingPrepSectionWeights } from '@/types';
import { isAttireReady } from './attireLogic';
import { isCeremonyMusicApproved } from './musicLogic';
import { mustHaveGroupsWithoutCoordinator } from './photographyLogic';
import { isCriticalCeremonyItem } from './ceremonyLogic';
import { todayISO } from './date';

export { DEFAULT_WEDDING_PREP_SECTION_WEIGHTS };
export type { WeddingPrepSectionWeights };

export const WEDDING_PREP_READINESS_LEVELS = ['Not Ready', 'At Risk', 'Mostly Ready', 'Ready'] as const;
export type WeddingPrepReadinessLevel = (typeof WEDDING_PREP_READINESS_LEVELS)[number];

export interface ReadinessCheck {
  label: string;
  passed: boolean;
}

export interface SectionReadiness {
  level: WeddingPrepReadinessLevel;
  ratio: number;
  checks: ReadinessCheck[];
  reasons: string[];
}

function classify(checks: ReadinessCheck[]): SectionReadiness {
  const passedCount = checks.filter((c) => c.passed).length;
  const ratio = checks.length === 0 ? 1 : passedCount / checks.length;
  let level: WeddingPrepReadinessLevel;
  if (ratio === 1) level = 'Ready';
  else if (ratio >= 0.75) level = 'Mostly Ready';
  else if (ratio >= 0.4) level = 'At Risk';
  else level = 'Not Ready';
  return { level, ratio, checks, reasons: checks.filter((c) => !c.passed).map((c) => c.label) };
}

function isRequirementDone(status: ChurchRequirement['status']): boolean {
  return (CHURCH_REQUIREMENT_DONE_STATUSES as readonly string[]).includes(status);
}

export function computeChurchReadiness(profile: ChurchProfile | undefined, requirements: ChurchRequirement[], referenceDate: string = todayISO()): SectionReadiness {
  const applicable = requirements.filter((r) => r.applicability === 'Applicable');
  const rehearsalReqs = requirements.filter((r) => r.category === 'Rehearsal');
  const witnessReqs = requirements.filter((r) => r.category === 'Witnesses');
  const documentReqs = requirements.filter((r) => r.category === 'Marriage Register' || r.category === 'Marriage Certificate');

  const checks: ReadinessCheck[] = [
    { label: 'Church profile created', passed: Boolean(profile) },
    { label: 'All applicable requirements complete', passed: applicable.length === 0 || applicable.every((r) => isRequirementDone(r.status)) },
    { label: 'Rehearsal complete', passed: rehearsalReqs.length === 0 || rehearsalReqs.every((r) => isRequirementDone(r.status)) },
    { label: 'Witnesses confirmed', passed: witnessReqs.length === 0 || witnessReqs.every((r) => isRequirementDone(r.status)) },
    { label: 'Marriage documents ready', passed: documentReqs.length === 0 || documentReqs.every((r) => isRequirementDone(r.status)) },
    {
      label: 'No overdue applicable requirements',
      passed: !applicable.some((r) => r.dueDate && r.dueDate < referenceDate && !isRequirementDone(r.status)),
    },
  ];
  return classify(checks);
}

export function computeCeremonyReadiness(participants: CeremonyParticipant[], sequenceItems: CeremonySequenceItem[], ceremonyItems: CeremonyItem[]): SectionReadiness {
  const applicableItems = ceremonyItems.filter((i) => i.applicability === 'Applicable');
  const criticalItems = applicableItems.filter((i) => isCriticalCeremonyItem(i, DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES));

  const checks: ReadinessCheck[] = [
    { label: 'Ceremony sequence created', passed: sequenceItems.length > 0 },
    { label: 'Sequence confirmed', passed: sequenceItems.length > 0 && sequenceItems.every((s) => s.status !== 'Planned') },
    { label: 'Participants confirmed', passed: participants.length > 0 && participants.every((p) => p.confirmed) },
    { label: 'Critical ceremony items verified', passed: criticalItems.length === 0 || criticalItems.every((i) => i.verificationStatus === 'Verified') },
    { label: 'Applicable items have a custodian', passed: applicableItems.length === 0 || applicableItems.every((i) => Boolean(i.custodian)) },
  ];
  return classify(checks);
}

export function computeCateringReadiness(plans: CateringPlan[], menuItems: MenuItem[]): SectionReadiness {
  const menuForPlans = menuItems.filter((m) => plans.some((p) => p.id === m.cateringPlanId));

  const checks: ReadinessCheck[] = [
    { label: 'Catering plan created', passed: plans.length > 0 },
    { label: 'Menu approved', passed: menuForPlans.length > 0 && menuForPlans.every((m) => m.approved) },
    { label: 'Guest count finalized', passed: plans.length > 0 && plans.every((p) => p.guaranteedCount !== undefined) },
    { label: 'Vendor linked', passed: plans.length > 0 && plans.every((p) => Boolean(p.vendorId)) },
    { label: 'Couple meal reserved', passed: plans.length === 0 || plans.every((p) => p.coupleMealReserved) },
  ];
  return classify(checks);
}

export function computeDecorReadiness(plans: DecorPlan[], _deliverables: DecorDeliverable[]): SectionReadiness {
  const checks: ReadinessCheck[] = [
    { label: 'Décor plans created', passed: plans.length > 0 },
    { label: 'Designs approved', passed: plans.length > 0 && plans.every((p) => p.approvalStatus === 'Approved') },
    { label: 'Install timing confirmed', passed: plans.length > 0 && plans.every((p) => Boolean(p.installDate && p.installStartTime)) },
    { label: 'Final walkthrough complete', passed: plans.length > 0 && plans.every((p) => p.finalWalkthroughComplete) },
    { label: 'All approved plans have a vendor', passed: !plans.some((p) => p.approvalStatus === 'Approved' && !p.vendorId) },
  ];
  return classify(checks);
}

export function computeAttireReadiness(profiles: AttireProfile[], items: AttireItem[], groomingAppointments: GroomingAppointment[]): SectionReadiness {
  const groom = profiles.filter((p) => p.personRole.trim().toLowerCase() === 'groom');
  const requiredItems = items.filter((i) => i.required);

  const checks: ReadinessCheck[] = [
    { label: 'Groom outfit ready', passed: groom.length === 0 || groom.every(isAttireReady) },
    { label: 'Family outfits ready', passed: profiles.length === 0 || profiles.every(isAttireReady) },
    { label: 'Accessories ready', passed: requiredItems.length === 0 || requiredItems.every((i) => i.status === 'Ready' || i.status === 'Packed') },
    {
      label: 'Grooming booked',
      passed: groomingAppointments.length > 0 && groomingAppointments.every((a) => a.status === 'Booked' || a.status === 'Confirmed' || a.status === 'Completed'),
    },
  ];
  return classify(checks);
}

export function computePhotographyReadiness(plans: PhotographyPlan[], groups: PhotoGroup[]): SectionReadiness {
  const checks: ReadinessCheck[] = [
    { label: 'Photography plan created', passed: plans.length > 0 },
    { label: 'Coverage confirmed', passed: plans.length > 0 && plans.every((p) => Boolean(p.coverageStart && p.coverageEnd)) },
    { label: 'Must-have photo groups confirmed', passed: mustHaveGroupsWithoutCoordinator(groups).length === 0 },
    { label: 'Church restrictions confirmed', passed: plans.length > 0 && plans.every((p) => p.churchRestrictionsConfirmed) },
    { label: 'Delivery due date set', passed: plans.length > 0 && plans.every((p) => Boolean(p.deliveryDueDate)) },
  ];
  return classify(checks);
}

export function computeMusicAVReadiness(plans: MusicAVPlan[], cues: MusicCue[]): SectionReadiness {
  const checks: ReadinessCheck[] = [
    { label: 'Music/AV plan created', passed: plans.length > 0 },
    { label: 'Cues approved', passed: isCeremonyMusicApproved(cues) },
    { label: 'Soundcheck scheduled', passed: plans.length > 0 && plans.every((p) => Boolean(p.soundcheckDate)) },
    { label: 'Emcee confirmed', passed: plans.length > 0 && plans.every((p) => Boolean(p.emceeName)) },
    { label: 'Backup readiness confirmed', passed: plans.length > 0 && plans.every((p) => Boolean(p.backupMicrophones) && p.offlinePlaylistReady) },
  ];
  return classify(checks);
}

export function computeGiftsKitsReadiness(giftPlans: GiftPlan[], welcomeKits: WelcomeKit[]): SectionReadiness {
  const readyGiftStatuses: GiftPlan['status'][] = ['Received', 'Packed', 'Distributed'];
  const familyOrClergyGifts = giftPlans.filter((p) => p.recipientType !== 'Guests');
  const guestFavors = giftPlans.filter((p) => p.recipientType === 'Guests');

  const checks: ReadinessCheck[] = [
    { label: 'Gift plans created', passed: giftPlans.length > 0 },
    { label: 'Gifts ready', passed: familyOrClergyGifts.length === 0 || familyOrClergyGifts.every((p) => readyGiftStatuses.includes(p.status)) },
    { label: 'Favors ready', passed: guestFavors.length === 0 || guestFavors.every((p) => readyGiftStatuses.includes(p.status)) },
    { label: 'Welcome kits ready', passed: welcomeKits.length === 0 || welcomeKits.every((k) => k.status === 'Packed' || k.status === 'Delivered') },
    { label: 'Distribution owners assigned', passed: !giftPlans.some((p) => !p.distributionOwner) && !welcomeKits.some((k) => !k.distributionOwner) },
  ];
  return classify(checks);
}

export interface WeddingPrepSections {
  church: SectionReadiness;
  ceremony: SectionReadiness;
  catering: SectionReadiness;
  decor: SectionReadiness;
  attire: SectionReadiness;
  photography: SectionReadiness;
  musicAV: SectionReadiness;
  giftsKits: SectionReadiness;
}

export interface OverallReadiness {
  percent: number;
  level: WeddingPrepReadinessLevel;
}

/** Section 34: weighted overall readiness — never presented as a bare number without the section breakdown. */
export function computeOverallReadiness(sections: WeddingPrepSections, weights: WeddingPrepSectionWeights = DEFAULT_WEDDING_PREP_SECTION_WEIGHTS): OverallReadiness {
  const keys = Object.keys(weights) as (keyof WeddingPrepSectionWeights)[];
  const totalWeight = keys.reduce((sum, key) => sum + Math.max(0, weights[key]), 0);
  if (totalWeight === 0) return { percent: 0, level: 'Not Ready' };

  const weightedSum = keys.reduce((sum, key) => sum + sections[key].ratio * Math.max(0, weights[key]), 0);
  const ratio = weightedSum / totalWeight;
  const percent = Math.round(ratio * 1000) / 10;

  let level: WeddingPrepReadinessLevel;
  if (ratio === 1) level = 'Ready';
  else if (ratio >= 0.75) level = 'Mostly Ready';
  else if (ratio >= 0.4) level = 'At Risk';
  else level = 'Not Ready';

  return { percent, level };
}
