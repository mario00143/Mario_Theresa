import { beforeEach, describe, expect, it } from 'vitest';
import {
  attireItemsStore,
  attireProfilesStore,
  cateringPlansStore,
  ceremonyItemsStore,
  ceremonyParticipantsStore,
  churchProfilesStore,
  churchRequirementsStore,
  decorDeliverablesStore,
  decorPlansStore,
  giftPlansStore,
  menuItemsStore,
  musicCuesStore,
  photoGroupsStore,
  resetToDemoData,
  vendorsStore,
} from '@/data/stores';
import {
  attireReadinessToCSV,
  cateringSummaryToCSV,
  ceremonyItemsToCSV,
  ceremonyParticipantsToCSV,
  churchRequirementsToCSV,
  decorPlansToCSV,
  giftsFavorsToCSV,
  menuToCSV,
  musicCueSheetToCSV,
  photoGroupListToCSV,
  weddingPrepIssuesToCSV,
  weddingPrepReadinessToCSV,
} from '@/data/repositories/weddingPrepCsv';
import { detectWeddingPrepIssues } from '@/utils/weddingPrepDataQuality';
import { computeChurchReadiness } from '@/utils/weddingPrepReadiness';

describe('wedding prep CSV exports', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('produces church requirements CSV with a header row and one row per requirement', () => {
    const csv = churchRequirementsToCSV(churchRequirementsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Applicability');
    expect(lines.length).toBe(churchRequirementsStore.get().length + 1);
  });

  it('produces ceremony participants CSV with a header row and one row per participant', () => {
    const csv = ceremonyParticipantsToCSV(ceremonyParticipantsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Role');
    expect(lines.length).toBe(ceremonyParticipantsStore.get().length + 1);
  });

  it('produces ceremony items CSV with a header row and one row per item', () => {
    const csv = ceremonyItemsToCSV(ceremonyItemsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Custodian');
    expect(lines.length).toBe(ceremonyItemsStore.get().length + 1);
  });

  it('produces catering summary CSV with a header row and one row per plan', () => {
    const csv = cateringSummaryToCSV(cateringPlansStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Guaranteed Count');
    expect(lines.length).toBe(cateringPlansStore.get().length + 1);
  });

  it('produces menu CSV with a header row and one row per menu item', () => {
    const csv = menuToCSV(menuItemsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Dietary Type');
    expect(lines.length).toBe(menuItemsStore.get().length + 1);
  });

  it('produces décor plans CSV with a header row and one row per plan', () => {
    const csv = decorPlansToCSV(decorPlansStore.get(), decorDeliverablesStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Deliverable Count');
    expect(lines.length).toBe(decorPlansStore.get().length + 1);
  });

  it('produces attire readiness CSV with a header row and one row per profile', () => {
    const csv = attireReadinessToCSV(attireProfilesStore.get(), attireItemsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Items Total');
    expect(lines.length).toBe(attireProfilesStore.get().length + 1);
  });

  it('produces photo group list CSV with a header row and one row per group', () => {
    const csv = photoGroupListToCSV(photoGroupsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Priority');
    expect(lines.length).toBe(photoGroupsStore.get().length + 1);
  });

  it('produces music cue sheet CSV with a header row and one row per cue', () => {
    const csv = musicCueSheetToCSV(musicCuesStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Cue Type');
    expect(lines.length).toBe(musicCuesStore.get().length + 1);
  });

  it('produces gifts and favors CSV with a header row and one row per gift plan', () => {
    const csv = giftsFavorsToCSV(giftPlansStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Recipient Type');
    expect(lines.length).toBe(giftPlansStore.get().length + 1);
  });

  it('produces wedding prep issues CSV with a header row and one row per issue', () => {
    const issues = detectWeddingPrepIssues({
      churchProfile: churchProfilesStore.get()[0],
      churchRequirements: churchRequirementsStore.get(),
      ceremonyParticipants: ceremonyParticipantsStore.get(),
      ceremonyItems: ceremonyItemsStore.get(),
      cateringPlans: cateringPlansStore.get(),
      menuItems: menuItemsStore.get(),
      decorPlans: decorPlansStore.get(),
      attireProfiles: attireProfilesStore.get(),
      attireItems: attireItemsStore.get(),
      photographyPlans: [],
      photoGroups: photoGroupsStore.get(),
      musicCues: musicCuesStore.get(),
      musicAVPlans: [],
      giftPlans: giftPlansStore.get(),
      welcomeKits: [],
      weddingDateTimeISO: '2027-01-30T10:00:00.000Z',
      confirmedWeddingAttendance: 55,
      favorBuffer: 10,
    });
    const csv = weddingPrepIssuesToCSV(issues);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Category');
    expect(lines.length).toBe(issues.length + 1);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('produces wedding prep readiness CSV with a header row and one row per section', () => {
    const church = churchProfilesStore.get()[0];
    const readiness = computeChurchReadiness(church, churchRequirementsStore.get());
    const csv = weddingPrepReadinessToCSV({ Church: readiness });
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Failed Checks');
    expect(lines.length).toBe(2);
  });
});
