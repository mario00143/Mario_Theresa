import { describe, expect, it } from 'vitest';
import type { WeddingPrepDataInput } from '@/utils/weddingPrepDataQuality';
import { detectWeddingPrepIssues, type WeddingPrepIssueCategory } from '@/utils/weddingPrepDataQuality';

function essentialParticipants() {
  return [
    { id: 'p-groom', role: 'Groom' as const, name: 'Groom', confirmed: true, rehearsalRequired: false, rehearsalConfirmed: false, createdAt: 't', updatedAt: 't' },
    { id: 'p-bride', role: 'Bride' as const, name: 'Bride', confirmed: true, rehearsalRequired: false, rehearsalConfirmed: false, createdAt: 't', updatedAt: 't' },
    { id: 'p-clergy', role: 'Clergy' as const, name: 'Fr. Thomas', confirmed: true, rehearsalRequired: false, rehearsalConfirmed: false, createdAt: 't', updatedAt: 't' },
  ];
}

function baseInput(overrides: Partial<WeddingPrepDataInput> = {}): WeddingPrepDataInput {
  return {
    churchProfile: undefined,
    churchRequirements: [],
    ceremonyParticipants: essentialParticipants(),
    ceremonyItems: [],
    cateringPlans: [],
    menuItems: [],
    decorPlans: [],
    attireProfiles: [],
    attireItems: [],
    photographyPlans: [],
    photoGroups: [],
    musicCues: [],
    musicAVPlans: [],
    giftPlans: [],
    welcomeKits: [],
    weddingDateTimeISO: '2027-01-30T10:00:00.000Z',
    confirmedWeddingAttendance: 50,
    favorBuffer: 10,
    referenceDateTimeISO: '2027-01-20T00:00:00.000Z',
    ...overrides,
  };
}

function hasCategory(input: WeddingPrepDataInput, category: WeddingPrepIssueCategory): boolean {
  return detectWeddingPrepIssues(input).some((i) => i.category === category);
}

describe('wedding prep data quality checks (section 35)', () => {
  it('flags an overdue church requirement', () => {
    const input = baseInput({
      churchRequirements: [
        { id: 'r-1', churchProfileId: 'c-1', title: 'Submit address proof', category: 'Other', applicability: 'Applicable', status: 'Not Started', documentRequired: false, dueDate: '2027-01-01', createdAt: 't', updatedAt: 't' },
      ],
    });
    expect(hasCategory(input, 'church-requirement-overdue')).toBe(true);
  });

  it('flags a Confirm with Parish requirement within 30 days of the wedding', () => {
    const input = baseInput({
      churchRequirements: [
        { id: 'r-1', churchProfileId: 'c-1', title: 'Inter-parish permission', category: 'Inter-Parish Permission', applicability: 'Confirm with Parish', status: 'Not Started', documentRequired: false, createdAt: 't', updatedAt: 't' },
      ],
    });
    expect(hasCategory(input, 'parish-confirmation-unresolved')).toBe(true);
  });

  it('flags an unconfirmed witness', () => {
    const input = baseInput({
      ceremonyParticipants: [...essentialParticipants(), { id: 'p-witness', role: 'Witness', name: 'Neha', confirmed: false, rehearsalRequired: false, rehearsalConfirmed: false, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'witness-not-confirmed')).toBe(true);
  });

  it('flags an unassigned essential ceremony role', () => {
    const input = baseInput({ ceremonyParticipants: [] });
    expect(hasCategory(input, 'ceremony-role-unassigned')).toBe(true);
  });

  it('flags an unverified critical ceremony item within 7 days of the wedding', () => {
    const input = baseInput({
      ceremonyItems: [{ id: 'i-1', name: 'Rings', category: 'Rings', applicability: 'Applicable', status: 'Ready', verificationStatus: 'Not Verified', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-25T00:00:00.000Z',
    });
    expect(hasCategory(input, 'critical-ceremony-item-unverified')).toBe(true);
  });

  it('flags rings not Ready within 14 days of the wedding', () => {
    const input = baseInput({
      ceremonyItems: [{ id: 'i-1', name: 'Rings', category: 'Rings', applicability: 'Applicable', status: 'Not Procured', verificationStatus: 'Verified', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-20T00:00:00.000Z',
    });
    expect(hasCategory(input, 'rings-not-ready')).toBe(true);
  });

  it('flags unresolved minnu applicability within 30 days of the wedding', () => {
    const input = baseInput({
      ceremonyItems: [{ id: 'i-1', name: 'Minnu', category: 'Minnu', applicability: 'Confirm with Parish / Family', status: 'Not Procured', verificationStatus: 'Not Verified', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-15T00:00:00.000Z',
    });
    expect(hasCategory(input, 'minnu-unresolved')).toBe(true);
  });

  it('flags unresolved manthrakodi applicability within 30 days of the wedding', () => {
    const input = baseInput({
      ceremonyItems: [{ id: 'i-1', name: 'Manthrakodi', category: 'Manthrakodi', applicability: 'Confirm with Parish / Family', status: 'Not Procured', verificationStatus: 'Not Verified', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-15T00:00:00.000Z',
    });
    expect(hasCategory(input, 'manthrakodi-unresolved')).toBe(true);
  });

  it('flags a guaranteed catering count below confirmed RSVP attendance', () => {
    const input = baseInput({
      cateringPlans: [{ id: 'p-1', event: 'Wedding', serviceStyle: 'Buffet', guaranteedCount: 30, coupleMealReserved: true, createdAt: 't', updatedAt: 't' }],
      confirmedWeddingAttendance: 55,
    });
    expect(hasCategory(input, 'catering-count-below-rsvp')).toBe(true);
  });

  it('flags an overdue final catering count', () => {
    const input = baseInput({
      cateringPlans: [{ id: 'p-1', event: 'Wedding', serviceStyle: 'Buffet', finalCountDueDate: '2027-01-01', coupleMealReserved: true, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'final-count-overdue')).toBe(true);
  });

  it('flags an undocumented allergen plan on the menu', () => {
    const input = baseInput({
      cateringPlans: [{ id: 'p-1', event: 'Wedding', serviceStyle: 'Buffet', coupleMealReserved: true, createdAt: 't', updatedAt: 't' }],
      menuItems: [{ id: 'm-1', cateringPlanId: 'p-1', course: 'Main Course', name: 'Rice', dietaryType: 'Vegetarian', liveCounter: false, approved: true, tastingStatus: 'Not Scheduled', createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'dietary-allergies-unresolved')).toBe(true);
  });

  it('flags a décor install scheduled before church access opens', () => {
    const input = baseInput({
      churchProfile: { id: 'c-1', event: 'Wedding', churchName: 'Church', denomination: 'Syro-Malabar', ceremonyDate: '2027-01-30', accessStartTime: '07:00', createdAt: 't', updatedAt: 't' },
      decorPlans: [
        { id: 'd-1', event: 'Wedding', area: 'Church Aisle', installDate: '2027-01-30', installStartTime: '06:30', approvalStatus: 'Approved', finalWalkthroughComplete: true, createdAt: 't', updatedAt: 't' },
      ],
    });
    expect(hasCategory(input, 'decor-install-timing-conflict')).toBe(true);
  });

  it('flags an incomplete décor walkthrough on the eve of the wedding', () => {
    const input = baseInput({
      decorPlans: [{ id: 'd-1', event: 'Wedding', area: 'Stage', approvalStatus: 'Approved', finalWalkthroughComplete: false, createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-29T00:00:00.000Z',
    });
    expect(hasCategory(input, 'decor-walkthrough-incomplete')).toBe(true);
  });

  it('flags the groom outfit not Ready within 14 days of the wedding', () => {
    const input = baseInput({
      attireProfiles: [{ id: 'a-1', personRole: 'Groom', event: 'Wedding', outfitType: 'Sherwani', status: 'Ordered', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-20T00:00:00.000Z',
    });
    expect(hasCategory(input, 'groom-attire-not-ready')).toBe(true);
  });

  it('flags a final fitting that was scheduled in the past but never completed', () => {
    const input = baseInput({
      attireProfiles: [{ id: 'a-1', personRole: 'Groom', event: 'Wedding', outfitType: 'Sherwani', status: 'Selected', finalFittingDate: '2026-07-25', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2026-08-01T00:00:00.000Z',
    });
    expect(hasCategory(input, 'final-fitting-overdue')).toBe(true);
  });

  it('flags a required attire item that has not been started', () => {
    const input = baseInput({
      attireProfiles: [{ id: 'a-1', personRole: 'Groom', event: 'Wedding', outfitType: 'Sherwani', status: 'Ready', createdAt: 't', updatedAt: 't' }],
      attireItems: [{ id: 'i-1', attireProfileId: 'a-1', itemName: 'Cufflinks', category: 'Cufflinks', required: true, status: 'Not Started', backupAvailable: false, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'critical-attire-item-missing')).toBe(true);
  });

  it('flags unconfirmed church photography restrictions', () => {
    const input = baseInput({
      photographyPlans: [{ id: 'ph-1', event: 'Wedding', droneRequired: false, liveStreamingRequired: false, sameDayEditRequired: false, rawFilesIncluded: false, albumIncluded: false, highlightsVideoIncluded: false, fullFilmIncluded: false, churchRestrictionsConfirmed: false, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'photography-restrictions-unknown')).toBe(true);
  });

  it('flags a must-have photo group with no coordinator', () => {
    const input = baseInput({
      photoGroups: [{ id: 'g-1', event: 'Wedding', groupName: 'Couple with grandparents', sequenceOrder: 1, participants: [], priority: 'Must Have', completed: false, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'must-have-photo-group-unassigned')).toBe(true);
  });

  it('flags an overdue soundcheck', () => {
    const input = baseInput({
      musicAVPlans: [{ id: 'm-1', event: 'Wedding', podiumRequired: false, offlinePlaylistReady: true, backupBatteriesReady: true, createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-29T12:00:00.000Z',
    });
    expect(hasCategory(input, 'soundcheck-overdue')).toBe(true);
  });

  it('flags a missing emcee', () => {
    const input = baseInput({
      musicAVPlans: [{ id: 'm-1', event: 'Wedding', podiumRequired: false, offlinePlaylistReady: true, backupBatteriesReady: true, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'emcee-missing')).toBe(true);
  });

  it('flags a missing offline music backup', () => {
    const input = baseInput({
      musicAVPlans: [{ id: 'm-1', event: 'Wedding', emceeName: 'MC', podiumRequired: false, offlinePlaylistReady: false, backupBatteriesReady: true, createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'offline-music-backup-missing')).toBe(true);
  });

  it('flags a welcome kit short of its target quantity', () => {
    const input = baseInput({
      welcomeKits: [{ id: 'k-1', name: 'Family kit', quantityPlanned: 40, quantityPrepared: 25, distributionOwner: 'Groom Mother', status: 'Planned', createdAt: 't', updatedAt: 't' }],
    });
    expect(hasCategory(input, 'welcome-kits-insufficient')).toBe(true);
  });

  it('uses a supplied welcome kit target count instead of the planned quantity when available', () => {
    const input = baseInput({
      welcomeKits: [{ id: 'k-1', name: 'Family kit', quantityPlanned: 20, quantityPrepared: 25, distributionOwner: 'Groom Mother', status: 'Planned', createdAt: 't', updatedAt: 't' }],
      welcomeKitTargetCounts: { 'k-1': 30 },
    });
    expect(hasCategory(input, 'welcome-kits-insufficient')).toBe(true);
  });

  it('flags insufficient guest favors relative to confirmed attendance plus buffer', () => {
    const input = baseInput({
      giftPlans: [{ id: 'g-1', recipientType: 'Guests', event: 'Wedding', giftType: 'Favor box', quantity: 40, status: 'Planned', createdAt: 't', updatedAt: 't' }],
      confirmedWeddingAttendance: 55,
      favorBuffer: 10,
    });
    expect(hasCategory(input, 'guest-favors-insufficient')).toBe(true);
  });

  it('flags an important family/clergy gift not Ready within 7 days of the wedding', () => {
    const input = baseInput({
      giftPlans: [{ id: 'g-1', recipientType: 'Clergy', event: 'Wedding', giftType: 'Stole', quantity: 1, status: 'Planned', createdAt: 't', updatedAt: 't' }],
      referenceDateTimeISO: '2027-01-25T00:00:00.000Z',
    });
    expect(hasCategory(input, 'important-gifts-not-ready')).toBe(true);
  });

  it('produces no issues for a fully clean, empty input beyond essential ceremony roles', () => {
    const issues = detectWeddingPrepIssues(baseInput({ confirmedWeddingAttendance: 0, favorBuffer: 0 }));
    expect(issues).toEqual([]);
  });
});
