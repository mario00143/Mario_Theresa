import type {
  AttireItem,
  AttireProfile,
  CateringPlan,
  CeremonyItem,
  CeremonyParticipant,
  ChurchRequirement,
  DecorDeliverable,
  DecorPlan,
  GiftPlan,
  MenuItem,
  MusicCue,
  PhotoGroup,
  Vendor,
} from '@/types';
import type { WeddingPrepIssue } from '@/utils/weddingPrepDataQuality';
import type { SectionReadiness } from '@/utils/weddingPrepReadiness';
import { isAttireReady } from '@/utils/attireLogic';
import { csvEscape } from '@/utils/csv';

export function churchRequirementsToCSV(requirements: ChurchRequirement[]): string {
  const headers = ['Title', 'Category', 'Applicability', 'Owner', 'Due Date', 'Status', 'Document Required', 'Document Name', 'Submitted Date', 'Verified Date', 'Verified By', 'Notes'];
  const rows = requirements.map((r) =>
    [r.title, r.category, r.applicability, r.owner ?? '', r.dueDate ?? '', r.status, r.documentRequired ? 'Yes' : 'No', r.documentName ?? '', r.submittedDate ?? '', r.verifiedDate ?? '', r.verifiedBy ?? '', r.notes ?? '']
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function ceremonyParticipantsToCSV(participants: CeremonyParticipant[]): string {
  const headers = ['Role', 'Name', 'Side', 'Confirmed', 'Phone', 'Email', 'Backup Name', 'Backup Phone', 'Arrival Time', 'Rehearsal Required', 'Rehearsal Confirmed'];
  const rows = participants.map((p) =>
    [p.role, p.name, p.side ?? '', p.confirmed ? 'Yes' : 'No', p.phone ?? '', p.email ?? '', p.backupName ?? '', p.backupPhone ?? '', p.arrivalTime ?? '', p.rehearsalRequired ? 'Yes' : 'No', p.rehearsalConfirmed ? 'Yes' : 'No']
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function ceremonyItemsToCSV(items: CeremonyItem[]): string {
  const headers = ['Name', 'Category', 'Applicability', 'Owner', 'Custodian', 'Backup Custodian', 'Storage Location', 'Required By Date', 'Status', 'Verification Status'];
  const rows = items.map((i) =>
    [i.name, i.category, i.applicability, i.owner ?? '', i.custodian ?? '', i.backupCustodian ?? '', i.storageLocation ?? '', i.requiredByDate ?? '', i.status, i.verificationStatus]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function cateringSummaryToCSV(plans: CateringPlan[]): string {
  const headers = [
    'Event', 'Service Style', 'Guest Count Target', 'Guaranteed Count', 'Final Count Due Date',
    'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Child', 'Infant',
    'Vendor Meals', 'Clergy Meals', 'Couple Meal Reserved',
  ];
  const rows = plans.map((p) =>
    [
      p.event, p.serviceStyle, p.guestCountTarget ?? '', p.guaranteedCount ?? '', p.finalCountDueDate ?? '',
      p.vegetarianCount ?? '', p.nonVegetarianCount ?? '', p.veganCount ?? '', p.jainCount ?? '', p.childCount ?? '', p.infantCount ?? '',
      p.vendorMealCount ?? '', p.clergyMealCount ?? '', p.coupleMealReserved ? 'Yes' : 'No',
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function menuToCSV(menuItems: MenuItem[]): string {
  const headers = ['Course', 'Name', 'Dietary Type', 'Allergens', 'Live Counter', 'Approved', 'Tasting Status'];
  const rows = menuItems.map((m) =>
    [m.course, m.name, m.dietaryType, m.allergens ?? '', m.liveCounter ? 'Yes' : 'No', m.approved ? 'Yes' : 'No', m.tastingStatus].map(csvEscape).join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function decorPlansToCSV(plans: DecorPlan[], deliverables: DecorDeliverable[], vendors: Vendor[]): string {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const headers = ['Area', 'Theme', 'Vendor', 'Install Date', 'Install Start Time', 'Teardown Deadline', 'Approval Status', 'Final Walkthrough Complete', 'Deliverable Count'];
  const rows = plans.map((p) =>
    [
      p.area,
      p.theme ?? '',
      p.vendorId ? (vendorById.get(p.vendorId)?.name ?? '') : '',
      p.installDate ?? '',
      p.installStartTime ?? '',
      p.teardownDeadline ?? '',
      p.approvalStatus,
      p.finalWalkthroughComplete ? 'Yes' : 'No',
      deliverables.filter((d) => d.decorPlanId === p.id).length,
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function attireReadinessToCSV(profiles: AttireProfile[], items: AttireItem[]): string {
  const headers = ['Person Role', 'Outfit Type', 'Status', 'Ready', 'Final Fitting Date', 'Ready Date', 'Items Ready', 'Items Total'];
  const rows = profiles.map((p) => {
    const profileItems = items.filter((i) => i.attireProfileId === p.id);
    const readyItems = profileItems.filter((i) => i.status === 'Ready' || i.status === 'Packed').length;
    return [p.personRole, p.outfitType, p.status, isAttireReady(p) ? 'Yes' : 'No', p.finalFittingDate ?? '', p.readyDate ?? '', readyItems, profileItems.length]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function photoGroupListToCSV(groups: PhotoGroup[]): string {
  const headers = ['Sequence', 'Group Name', 'Priority', 'Coordinator', 'Location', 'Completed'];
  const rows = groups.map((g) => [g.sequenceOrder, g.groupName, g.priority, g.coordinator ?? '', g.location ?? '', g.completed ? 'Yes' : 'No'].map(csvEscape).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function musicCueSheetToCSV(cues: MusicCue[]): string {
  const headers = ['Sequence', 'Cue Type', 'Title', 'Performer', 'Planned Time', 'Approved', 'Backup Available'];
  const rows = cues.map((c) => [c.sequenceOrder, c.cueType, c.title, c.performer ?? '', c.plannedTime ?? '', c.approved ? 'Yes' : 'No', c.backupAvailable ? 'Yes' : 'No'].map(csvEscape).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function giftsFavorsToCSV(giftPlans: GiftPlan[]): string {
  const headers = ['Recipient Type', 'Recipient Name', 'Gift Type', 'Quantity', 'Status', 'Custodian', 'Distribution Owner'];
  const rows = giftPlans.map((p) =>
    [p.recipientType, p.recipientName ?? '', p.giftType, p.quantity, p.status, p.custodian ?? '', p.distributionOwner ?? ''].map(csvEscape).join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function weddingPrepIssuesToCSV(issues: WeddingPrepIssue[]): string {
  const headers = ['Category', 'Message', 'Link Type', 'Link Id'];
  const rows = issues.map((i) => [i.category, i.message, i.linkType, i.linkId].map(csvEscape).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function weddingPrepReadinessToCSV(sections: Record<string, SectionReadiness>): string {
  const headers = ['Section', 'Level', 'Ratio', 'Failed Checks'];
  const rows = Object.entries(sections).map(([name, readiness]) =>
    [name, readiness.level, `${Math.round(readiness.ratio * 100)}%`, readiness.reasons.join('; ')].map(csvEscape).join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

function csvFilename(slug: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-${slug}-${stamp}.csv`;
}

export const churchRequirementsCsvFilename = () => csvFilename('church-requirements');
export const ceremonyParticipantsCsvFilename = () => csvFilename('ceremony-participants');
export const ceremonyItemsCsvFilename = () => csvFilename('ceremony-items');
export const cateringSummaryCsvFilename = () => csvFilename('catering-summary');
export const menuCsvFilename = () => csvFilename('menu');
export const decorPlansCsvFilename = () => csvFilename('decor-plans');
export const attireReadinessCsvFilename = () => csvFilename('attire-readiness');
export const photoGroupListCsvFilename = () => csvFilename('photo-group-list');
export const musicCueSheetCsvFilename = () => csvFilename('music-cue-sheet');
export const giftsFavorsCsvFilename = () => csvFilename('gifts-favors');
export const weddingPrepIssuesCsvFilename = () => csvFilename('wedding-prep-issues');
export const weddingPrepReadinessCsvFilename = () => csvFilename('wedding-prep-readiness');
