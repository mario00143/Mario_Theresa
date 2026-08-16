import type {
  AttireItem,
  AttireProfile,
  CateringPlan,
  CeremonyItem,
  CeremonyParticipant,
  ChurchProfile,
  ChurchRequirement,
  DecorPlan,
  GiftPlan,
  MenuItem,
  MusicAVPlan,
  MusicCue,
  PhotoGroup,
  PhotographyPlan,
  WelcomeKit,
} from '@/types';
import { CHURCH_REQUIREMENT_DONE_STATUSES } from '@/types';
import { isChurchAreaDecorPlan } from './decorLogic';
import { isAttireReady } from './attireLogic';
import { isSoundcheckOverdue } from './musicLogic';
import { mustHaveGroupsWithoutCoordinator } from './photographyLogic';
import { isCriticalCeremonyItem, isCeremonyItemReady } from './ceremonyLogic';
import { isGuestFavorCountInsufficient } from './giftLogic';
import { daysUntil, todayISO } from './date';

export type WeddingPrepIssueCategory =
  | 'church-requirement-overdue'
  | 'parish-confirmation-unresolved'
  | 'witness-not-confirmed'
  | 'ceremony-role-unassigned'
  | 'critical-ceremony-item-unverified'
  | 'rings-not-ready'
  | 'minnu-unresolved'
  | 'manthrakodi-unresolved'
  | 'catering-count-below-rsvp'
  | 'dietary-allergies-unresolved'
  | 'final-count-overdue'
  | 'decor-install-timing-conflict'
  | 'decor-walkthrough-incomplete'
  | 'groom-attire-not-ready'
  | 'final-fitting-overdue'
  | 'critical-attire-item-missing'
  | 'photography-restrictions-unknown'
  | 'must-have-photo-group-unassigned'
  | 'soundcheck-overdue'
  | 'emcee-missing'
  | 'offline-music-backup-missing'
  | 'welcome-kits-insufficient'
  | 'guest-favors-insufficient'
  | 'important-gifts-not-ready';

export type WeddingPrepLinkType =
  | 'churchRequirement'
  | 'ceremonyParticipant'
  | 'ceremonyItem'
  | 'cateringPlan'
  | 'decorPlan'
  | 'attireProfile'
  | 'photographyPlan'
  | 'photoGroup'
  | 'musicAVPlan'
  | 'giftPlan'
  | 'welcomeKit';

export interface WeddingPrepIssue {
  id: string;
  category: WeddingPrepIssueCategory;
  message: string;
  linkType: WeddingPrepLinkType;
  linkId: string;
}

export interface WeddingPrepDataInput {
  churchProfile: ChurchProfile | undefined;
  churchRequirements: ChurchRequirement[];
  ceremonyParticipants: CeremonyParticipant[];
  ceremonyItems: CeremonyItem[];
  cateringPlans: CateringPlan[];
  menuItems: MenuItem[];
  decorPlans: DecorPlan[];
  attireProfiles: AttireProfile[];
  attireItems: AttireItem[];
  photographyPlans: PhotographyPlan[];
  photoGroups: PhotoGroup[];
  musicCues: MusicCue[];
  musicAVPlans: MusicAVPlan[];
  giftPlans: GiftPlan[];
  welcomeKits: WelcomeKit[];
  weddingDateTimeISO: string;
  /** RSVP-confirmed attendance for the wedding, used for catering/favor sufficiency checks. */
  confirmedWeddingAttendance: number;
  /** Extra favors to keep beyond confirmed attendance. */
  favorBuffer: number;
  /** Per-welcome-kit confirmed target guest counts, keyed by kit id, where known. */
  welcomeKitTargetCounts?: Record<string, number>;
  referenceDateTimeISO?: string;
}

function isRequirementDone(status: ChurchRequirement['status']): boolean {
  return (CHURCH_REQUIREMENT_DONE_STATUSES as readonly string[]).includes(status);
}

const ESSENTIAL_CEREMONY_ROLES = ['Groom', 'Bride', 'Clergy'] as const;

export function detectWeddingPrepIssues(input: WeddingPrepDataInput): WeddingPrepIssue[] {
  const referenceDateTimeISO = input.referenceDateTimeISO ?? new Date().toISOString();
  const referenceDate = todayISO(new Date(referenceDateTimeISO));
  const weddingDate = todayISO(new Date(input.weddingDateTimeISO));
  const issues: WeddingPrepIssue[] = [];

  // 1. Church requirement overdue.
  for (const req of input.churchRequirements) {
    if (req.applicability === 'Applicable' && req.dueDate && req.dueDate < referenceDate && !isRequirementDone(req.status)) {
      issues.push({
        id: `church-overdue-${req.id}`,
        category: 'church-requirement-overdue',
        message: `Church requirement "${req.title}" is overdue.`,
        linkType: 'churchRequirement',
        linkId: req.id,
      });
    }
    // 2. Parish confirmation unresolved (within 30 days of the wedding).
    if (req.applicability === 'Confirm with Parish') {
      const daysLeft = daysUntil(weddingDate, new Date(referenceDate));
      if (daysLeft !== null && daysLeft <= 30) {
        issues.push({
          id: `parish-unresolved-${req.id}`,
          category: 'parish-confirmation-unresolved',
          message: `"${req.title}" still needs parish confirmation, with ${daysLeft} day(s) to the wedding.`,
          linkType: 'churchRequirement',
          linkId: req.id,
        });
      }
    }
  }

  // 3. Witness not confirmed.
  for (const participant of input.ceremonyParticipants) {
    if (participant.role === 'Witness' && !participant.confirmed) {
      issues.push({
        id: `witness-unconfirmed-${participant.id}`,
        category: 'witness-not-confirmed',
        message: `Witness "${participant.name}" has not confirmed.`,
        linkType: 'ceremonyParticipant',
        linkId: participant.id,
      });
    }
  }

  // 4. Ceremony role unassigned (essential roles only).
  for (const role of ESSENTIAL_CEREMONY_ROLES) {
    if (!input.ceremonyParticipants.some((p) => p.role === role)) {
      issues.push({
        id: `role-unassigned-${role}`,
        category: 'ceremony-role-unassigned',
        message: `No participant assigned to the ${role} role.`,
        linkType: 'ceremonyParticipant',
        linkId: role,
      });
    }
  }

  // 5, 6, 7, 8. Ceremony item checks.
  const daysToWedding = daysUntil(weddingDate, new Date(referenceDate));
  for (const item of input.ceremonyItems) {
    if (item.applicability === 'Applicable' && isCriticalCeremonyItem(item) && item.verificationStatus !== 'Verified' && daysToWedding !== null && daysToWedding <= 7) {
      issues.push({
        id: `item-unverified-${item.id}`,
        category: 'critical-ceremony-item-unverified',
        message: `Critical item "${item.name}" is not verified with ${daysToWedding} day(s) to the wedding.`,
        linkType: 'ceremonyItem',
        linkId: item.id,
      });
    }
    if (item.category === 'Rings' && item.applicability === 'Applicable' && !isCeremonyItemReady(item) && daysToWedding !== null && daysToWedding <= 14) {
      issues.push({ id: `rings-not-ready-${item.id}`, category: 'rings-not-ready', message: 'Rings are not Ready.', linkType: 'ceremonyItem', linkId: item.id });
    }
    if (item.category === 'Minnu' && item.applicability === 'Confirm with Parish / Family' && daysToWedding !== null && daysToWedding <= 30) {
      issues.push({
        id: `minnu-unresolved-${item.id}`,
        category: 'minnu-unresolved',
        message: 'Minnu applicability is still unresolved.',
        linkType: 'ceremonyItem',
        linkId: item.id,
      });
    }
    if (item.category === 'Manthrakodi' && item.applicability === 'Confirm with Parish / Family' && daysToWedding !== null && daysToWedding <= 30) {
      issues.push({
        id: `manthrakodi-unresolved-${item.id}`,
        category: 'manthrakodi-unresolved',
        message: 'Manthrakodi applicability is still unresolved.',
        linkType: 'ceremonyItem',
        linkId: item.id,
      });
    }
  }

  // 9, 10, 11. Catering checks.
  for (const plan of input.cateringPlans) {
    if (plan.guaranteedCount !== undefined && plan.guaranteedCount < input.confirmedWeddingAttendance) {
      issues.push({
        id: `catering-below-rsvp-${plan.id}`,
        category: 'catering-count-below-rsvp',
        message: 'Guaranteed catering count is below confirmed RSVP attendance.',
        linkType: 'cateringPlan',
        linkId: plan.id,
      });
    }
    if (plan.finalCountDueDate && plan.finalCountDueDate < referenceDate && plan.guaranteedCount === undefined) {
      issues.push({
        id: `catering-final-overdue-${plan.id}`,
        category: 'final-count-overdue',
        message: 'Final catering count is overdue.',
        linkType: 'cateringPlan',
        linkId: plan.id,
      });
    }
    const planMenuItems = input.menuItems.filter((m) => m.cateringPlanId === plan.id);
    const hasAllergenPlan = planMenuItems.some((m) => m.allergens?.trim());
    if (!hasAllergenPlan && planMenuItems.length > 0) {
      issues.push({
        id: `catering-allergies-${plan.id}`,
        category: 'dietary-allergies-unresolved',
        message: 'No allergen plan documented on the menu.',
        linkType: 'cateringPlan',
        linkId: plan.id,
      });
    }
  }

  // 12, 13. Décor checks.
  for (const plan of input.decorPlans) {
    const atChurch = isChurchAreaDecorPlan(plan);
    if (atChurch && plan.installStartTime && input.churchProfile?.accessStartTime && plan.installDate === input.churchProfile.ceremonyDate) {
      if (plan.installStartTime < input.churchProfile.accessStartTime) {
        issues.push({
          id: `decor-timing-${plan.id}`,
          category: 'decor-install-timing-conflict',
          message: 'Décor installation is scheduled before church access opens.',
          linkType: 'decorPlan',
          linkId: plan.id,
        });
      }
    }
    if (!plan.finalWalkthroughComplete && daysToWedding !== null && daysToWedding <= 1) {
      issues.push({
        id: `decor-walkthrough-${plan.id}`,
        category: 'decor-walkthrough-incomplete',
        message: 'Final décor walkthrough is not complete.',
        linkType: 'decorPlan',
        linkId: plan.id,
      });
    }
  }

  // 14, 15, 16. Attire checks.
  for (const profile of input.attireProfiles) {
    const isGroom = profile.personRole.trim().toLowerCase() === 'groom';
    if (isGroom && !isAttireReady(profile) && daysToWedding !== null && daysToWedding <= 14) {
      issues.push({ id: `groom-attire-${profile.id}`, category: 'groom-attire-not-ready', message: 'Groom outfit is not Ready.', linkType: 'attireProfile', linkId: profile.id });
    }
    const fittingNotYetScheduled = !profile.finalFittingDate && daysToWedding !== null && daysToWedding <= 21;
    const fittingMissedPastDate = Boolean(profile.finalFittingDate && profile.finalFittingDate < referenceDate && !isAttireReady(profile));
    if (fittingNotYetScheduled || fittingMissedPastDate) {
      issues.push({
        id: `final-fitting-${profile.id}`,
        category: 'final-fitting-overdue',
        message: `Final fitting for ${profile.personRole} is overdue.`,
        linkType: 'attireProfile',
        linkId: profile.id,
      });
    }
    const missingCritical = input.attireItems.filter((i) => i.attireProfileId === profile.id && i.required && i.status === 'Not Started');
    for (const item of missingCritical) {
      issues.push({
        id: `attire-item-missing-${item.id}`,
        category: 'critical-attire-item-missing',
        message: `Critical accessory "${item.itemName}" missing for ${profile.personRole}.`,
        linkType: 'attireProfile',
        linkId: profile.id,
      });
    }
  }

  // 17, 18. Photography checks.
  for (const plan of input.photographyPlans) {
    if (!plan.churchRestrictionsConfirmed) {
      issues.push({
        id: `photo-restrictions-${plan.id}`,
        category: 'photography-restrictions-unknown',
        message: 'Church photography/video restrictions are not confirmed.',
        linkType: 'photographyPlan',
        linkId: plan.id,
      });
    }
  }
  for (const group of mustHaveGroupsWithoutCoordinator(input.photoGroups)) {
    issues.push({
      id: `photo-group-unassigned-${group.id}`,
      category: 'must-have-photo-group-unassigned',
      message: `Must-have photo group "${group.groupName}" has no coordinator.`,
      linkType: 'photoGroup',
      linkId: group.id,
    });
  }

  // 19, 20, 21. Music/AV checks.
  for (const plan of input.musicAVPlans) {
    if (isSoundcheckOverdue(plan, input.weddingDateTimeISO, referenceDateTimeISO)) {
      issues.push({ id: `soundcheck-${plan.id}`, category: 'soundcheck-overdue', message: 'Soundcheck is overdue.', linkType: 'musicAVPlan', linkId: plan.id });
    }
    if (!plan.emceeName) {
      issues.push({ id: `emcee-${plan.id}`, category: 'emcee-missing', message: 'No emcee assigned.', linkType: 'musicAVPlan', linkId: plan.id });
    }
    if (!plan.offlinePlaylistReady) {
      issues.push({
        id: `offline-music-${plan.id}`,
        category: 'offline-music-backup-missing',
        message: 'Offline music backup is not ready.',
        linkType: 'musicAVPlan',
        linkId: plan.id,
      });
    }
  }

  // 22. Welcome kits insufficient.
  for (const kit of input.welcomeKits) {
    const target = input.welcomeKitTargetCounts?.[kit.id] ?? kit.quantityPlanned;
    if (kit.quantityPrepared < target) {
      issues.push({
        id: `welcome-kit-insufficient-${kit.id}`,
        category: 'welcome-kits-insufficient',
        message: `Welcome kit "${kit.name}" is short of its target quantity.`,
        linkType: 'welcomeKit',
        linkId: kit.id,
      });
    }
  }

  // 23. Guest favors insufficient.
  if (isGuestFavorCountInsufficient(input.giftPlans, input.confirmedWeddingAttendance, input.favorBuffer)) {
    const favorPlan = input.giftPlans.find((p) => p.recipientType === 'Guests');
    issues.push({
      id: 'guest-favors-insufficient',
      category: 'guest-favors-insufficient',
      message: 'Guest favor quantity is below confirmed attendance plus buffer.',
      linkType: 'giftPlan',
      linkId: favorPlan?.id ?? 'guests',
    });
  }

  // 24. Important gifts not ready.
  const readyGiftStatuses: GiftPlan['status'][] = ['Received', 'Packed', 'Distributed'];
  for (const plan of input.giftPlans) {
    const isFamilyOrClergy = plan.recipientType === 'Bride Parents' || plan.recipientType === 'Groom Parents' || plan.recipientType === 'Clergy';
    if (isFamilyOrClergy && !readyGiftStatuses.includes(plan.status) && daysToWedding !== null && daysToWedding <= 7) {
      issues.push({
        id: `gift-not-ready-${plan.id}`,
        category: 'important-gifts-not-ready',
        message: `Gift for ${plan.recipientType} is not Ready.`,
        linkType: 'giftPlan',
        linkId: plan.id,
      });
    }
  }

  return issues;
}
