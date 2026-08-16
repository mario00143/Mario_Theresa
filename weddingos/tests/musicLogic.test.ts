import { describe, expect, it } from 'vitest';
import type { MusicAVPlan, MusicCue } from '@/types';
import { computeMusicAVPlanWarnings, isCeremonyMusicApproved, isSoundcheckOverdue } from '@/utils/musicLogic';

function cue(overrides: Partial<MusicCue> = {}): MusicCue {
  return {
    id: `cue-${Math.random()}`,
    event: 'Wedding',
    cueType: 'Processional',
    title: 'Bridal processional',
    sequenceOrder: 1,
    approved: true,
    backupAvailable: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function plan(overrides: Partial<MusicAVPlan> = {}): MusicAVPlan {
  return {
    id: 'plan-1',
    event: 'Wedding',
    podiumRequired: false,
    offlinePlaylistReady: true,
    backupBatteriesReady: true,
    backupMicrophones: 2,
    emceeName: 'MC Rahul',
    notes: 'Pronunciation confirmed with family.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ceremony music approval (section 28)', () => {
  it('is approved when all ceremony-type cues are approved', () => {
    const cues = [cue({ cueType: 'Processional', approved: true }), cue({ cueType: 'Hymn', approved: true })];
    expect(isCeremonyMusicApproved(cues)).toBe(true);
  });

  it('is not approved when any ceremony-type cue is unapproved', () => {
    const cues = [cue({ cueType: 'Processional', approved: true }), cue({ cueType: 'Hymn', approved: false })];
    expect(isCeremonyMusicApproved(cues)).toBe(false);
  });

  it('is not approved when there are no ceremony-type cues at all', () => {
    expect(isCeremonyMusicApproved([cue({ cueType: 'First Dance', approved: true })])).toBe(false);
  });

  it('ignores non-ceremony cue types when checking approval', () => {
    const cues = [cue({ cueType: 'Processional', approved: true }), cue({ cueType: 'First Dance', approved: false })];
    expect(isCeremonyMusicApproved(cues)).toBe(true);
  });
});

describe('soundcheck overdue (section 28)', () => {
  it('flags no soundcheck scheduled within 48 hours of the event', () => {
    expect(isSoundcheckOverdue(plan(), '2027-01-30T18:00:00.000Z', '2027-01-29T18:00:00.000Z')).toBe(true);
  });

  it('flags a soundcheck scheduled for after the current time within the window', () => {
    expect(isSoundcheckOverdue(plan({ soundcheckDate: '2027-01-30', soundcheckTime: '20:00' }), '2027-01-30T18:00:00.000Z', '2027-01-29T18:00:00.000Z')).toBe(true);
  });

  it('does not flag a soundcheck already completed in the past', () => {
    expect(isSoundcheckOverdue(plan({ soundcheckDate: '2027-01-29', soundcheckTime: '10:00' }), '2027-01-30T18:00:00.000Z', '2027-01-29T18:00:00.000Z')).toBe(false);
  });

  it('does not flag outside the 48-hour window', () => {
    expect(isSoundcheckOverdue(plan(), '2027-01-30T18:00:00.000Z', '2026-06-01T00:00:00.000Z')).toBe(false);
  });
});

describe('music/AV plan warnings (section 28)', () => {
  const eventDateTime = '2027-01-30T18:00:00.000Z';

  it('flags ceremony music not approved', () => {
    const warnings = computeMusicAVPlanWarnings(plan(), [cue({ cueType: 'Processional', approved: false })], eventDateTime, '2026-06-01T00:00:00.000Z');
    expect(warnings).toContain('Ceremony music not approved.');
  });

  it('flags a required choir not confirmed', () => {
    const warnings = computeMusicAVPlanWarnings(
      plan({ choirVendorId: 'choir-1' }),
      [cue({ cueType: 'Processional', approved: false })],
      eventDateTime,
      '2026-06-01T00:00:00.000Z',
    );
    expect(warnings).toContain('Choir required but not confirmed.');
  });

  it('does not flag the choir once a ceremony cue is approved', () => {
    const warnings = computeMusicAVPlanWarnings(
      plan({ choirVendorId: 'choir-1' }),
      [cue({ cueType: 'Processional', approved: true })],
      eventDateTime,
      '2026-06-01T00:00:00.000Z',
    );
    expect(warnings).not.toContain('Choir required but not confirmed.');
  });

  it('flags no emcee assigned', () => {
    const warnings = computeMusicAVPlanWarnings(plan({ emceeName: undefined }), [cue()], eventDateTime, '2026-06-01T00:00:00.000Z');
    expect(warnings).toContain('Emcee not assigned.');
  });

  it('flags no backup microphone available', () => {
    const warnings = computeMusicAVPlanWarnings(plan({ backupMicrophones: undefined }), [cue()], eventDateTime, '2026-06-01T00:00:00.000Z');
    expect(warnings).toContain('Backup microphone unavailable.');
  });

  it('flags the offline playlist not ready', () => {
    const warnings = computeMusicAVPlanWarnings(plan({ offlinePlaylistReady: false }), [cue()], eventDateTime, '2026-06-01T00:00:00.000Z');
    expect(warnings).toContain('Offline playlist not ready.');
  });

  it('flags pronunciation/script not confirmed when an emcee is assigned with no notes', () => {
    const warnings = computeMusicAVPlanWarnings(plan({ emceeName: 'MC Rahul', notes: '' }), [cue()], eventDateTime, '2026-06-01T00:00:00.000Z');
    expect(warnings).toContain('Name pronunciations/script not confirmed for the emcee.');
  });

  it('does not flag pronunciation once notes are on file', () => {
    const warnings = computeMusicAVPlanWarnings(plan({ emceeName: 'MC Rahul', notes: 'Confirmed pronunciations.' }), [cue()], eventDateTime, '2026-06-01T00:00:00.000Z');
    expect(warnings).not.toContain('Name pronunciations/script not confirmed for the emcee.');
  });
});
