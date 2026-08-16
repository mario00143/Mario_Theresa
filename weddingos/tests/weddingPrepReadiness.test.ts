import { describe, expect, it } from 'vitest';
import type { AttireProfile, CateringPlan, CeremonyItem, ChurchProfile, ChurchRequirement, DecorPlan, GiftPlan, MusicAVPlan, MusicCue, PhotographyPlan, WelcomeKit } from '@/types';
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
  DEFAULT_WEDDING_PREP_SECTION_WEIGHTS,
} from '@/utils/weddingPrepReadiness';

function church(overrides: Partial<ChurchProfile> = {}): ChurchProfile {
  return { id: 'church-1', event: 'Wedding', churchName: "St. Sebastian's", denomination: 'Syro-Malabar', createdAt: 't', updatedAt: 't', ...overrides };
}

function requirement(overrides: Partial<ChurchRequirement> = {}): ChurchRequirement {
  return {
    id: `req-${Math.random()}`,
    churchProfileId: 'church-1',
    title: 'Freedom to marry',
    category: 'Freedom to Marry',
    applicability: 'Applicable',
    status: 'Not Started',
    documentRequired: false,
    createdAt: 't',
    updatedAt: 't',
    ...overrides,
  };
}

describe('church readiness (section 34)', () => {
  it('is Mostly Ready when there is no church profile and no requirements', () => {
    const readiness = computeChurchReadiness(undefined, []);
    expect(readiness.level).toBe('Mostly Ready');
    expect(readiness.reasons).toContain('Church profile created');
  });

  it('is Ready once a profile exists and no requirements are outstanding', () => {
    expect(computeChurchReadiness(church(), []).level).toBe('Ready');
  });

  it('drops to Not Ready when applicable requirements are incomplete', () => {
    const readiness = computeChurchReadiness(church(), [
      requirement({ status: 'Not Started' }),
      requirement({ category: 'Witnesses' }),
      requirement({ category: 'Marriage Register' }),
    ]);
    expect(readiness.level).not.toBe('Ready');
    expect(readiness.reasons.length).toBeGreaterThan(0);
  });

  it('treats Not Applicable requirements as done, not blocking readiness', () => {
    const readiness = computeChurchReadiness(church(), [requirement({ applicability: 'Not Applicable' })]);
    expect(readiness.level).toBe('Ready');
  });
});

describe('ceremony readiness (section 34)', () => {
  function ceremonyItem(overrides: Partial<CeremonyItem> = {}): CeremonyItem {
    return {
      id: `item-${Math.random()}`,
      name: 'Rings',
      category: 'Rings',
      applicability: 'Applicable',
      status: 'Ready',
      verificationStatus: 'Verified',
      createdAt: 't',
      updatedAt: 't',
      ...overrides,
    };
  }

  it('is At Risk with nothing set up (item-related checks vacuously pass with no items to check)', () => {
    expect(computeCeremonyReadiness([], [], []).level).toBe('At Risk');
  });

  it('is Ready once the sequence is confirmed, participants confirmed, and critical items verified', () => {
    const readiness = computeCeremonyReadiness(
      [{ id: 'p-1', role: 'Groom', name: 'Groom', confirmed: true, rehearsalRequired: false, rehearsalConfirmed: false, createdAt: 't', updatedAt: 't' }],
      [{ id: 's-1', sequenceOrder: 1, title: 'Vows', participants: [], requiredItems: [], status: 'Confirmed', createdAt: 't', updatedAt: 't' }],
      [ceremonyItem({ custodian: 'Groom' })],
    );
    expect(readiness.level).toBe('Ready');
  });

  it('flags an unverified critical item', () => {
    const readiness = computeCeremonyReadiness(
      [],
      [{ id: 's-1', sequenceOrder: 1, title: 'Vows', participants: [], requiredItems: [], status: 'Confirmed', createdAt: 't', updatedAt: 't' }],
      [ceremonyItem({ verificationStatus: 'Not Verified', custodian: 'Groom' })],
    );
    expect(readiness.reasons).toContain('Critical ceremony items verified');
  });
});

describe('catering readiness (section 34)', () => {
  function plan(overrides: Partial<CateringPlan> = {}): CateringPlan {
    return { id: 'plan-1', event: 'Wedding', serviceStyle: 'Buffet', coupleMealReserved: true, createdAt: 't', updatedAt: 't', ...overrides };
  }

  it('is Not Ready with no catering plan', () => {
    expect(computeCateringReadiness([], []).level).toBe('Not Ready');
  });

  it('is Ready when a plan is complete with an approved menu and vendor', () => {
    const readiness = computeCateringReadiness(
      [plan({ guaranteedCount: 50, vendorId: 'vendor-1' })],
      [{ id: 'menu-1', cateringPlanId: 'plan-1', course: 'Main Course', name: 'Rice', dietaryType: 'Vegetarian', liveCounter: false, approved: true, tastingStatus: 'Completed', createdAt: 't', updatedAt: 't' }],
    );
    expect(readiness.level).toBe('Ready');
  });

  it('flags an unapproved menu item', () => {
    const readiness = computeCateringReadiness(
      [plan({ guaranteedCount: 50, vendorId: 'vendor-1' })],
      [{ id: 'menu-1', cateringPlanId: 'plan-1', course: 'Main Course', name: 'Rice', dietaryType: 'Vegetarian', liveCounter: false, approved: false, tastingStatus: 'Not Scheduled', createdAt: 't', updatedAt: 't' }],
    );
    expect(readiness.reasons).toContain('Menu approved');
  });
});

describe('décor readiness (section 34)', () => {
  function plan(overrides: Partial<DecorPlan> = {}): DecorPlan {
    return { id: 'plan-1', event: 'Wedding', area: 'Stage', approvalStatus: 'Pending', finalWalkthroughComplete: false, createdAt: 't', updatedAt: 't', ...overrides };
  }

  it('is Not Ready with no décor plans', () => {
    expect(computeDecorReadiness([], []).level).toBe('Not Ready');
  });

  it('is Ready once approved, timed, walked through, and vendor-linked', () => {
    const readiness = computeDecorReadiness(
      [plan({ approvalStatus: 'Approved', installDate: '2027-01-30', installStartTime: '08:00', finalWalkthroughComplete: true, vendorId: 'vendor-1' })],
      [],
    );
    expect(readiness.level).toBe('Ready');
  });
});

describe('attire readiness (section 34)', () => {
  function profile(overrides: Partial<AttireProfile> = {}): AttireProfile {
    return { id: 'profile-1', personRole: 'Groom', event: 'Wedding', outfitType: 'Sherwani', status: 'Ready', createdAt: 't', updatedAt: 't', ...overrides };
  }

  it('is Mostly Ready with nothing set up (profile/item checks vacuously pass with none to check)', () => {
    expect(computeAttireReadiness([], [], []).level).toBe('Mostly Ready');
  });

  it('is Ready once the groom is Ready and grooming is booked', () => {
    const readiness = computeAttireReadiness(
      [profile({ personRole: 'Groom', status: 'Ready' })],
      [],
      [{ id: 'g-1', personRole: 'Groom', type: 'Haircut', status: 'Booked', createdAt: 't', updatedAt: 't' }],
    );
    expect(readiness.level).toBe('Ready');
  });
});

describe('photography readiness (section 34)', () => {
  function plan(overrides: Partial<PhotographyPlan> = {}): PhotographyPlan {
    return {
      id: 'plan-1',
      event: 'Wedding',
      droneRequired: false,
      liveStreamingRequired: false,
      sameDayEditRequired: false,
      rawFilesIncluded: false,
      albumIncluded: false,
      highlightsVideoIncluded: false,
      fullFilmIncluded: false,
      churchRestrictionsConfirmed: true,
      coverageStart: '2027-01-30T06:00:00.000Z',
      coverageEnd: '2027-01-30T22:00:00.000Z',
      deliveryDueDate: '2027-03-01',
      createdAt: 't',
      updatedAt: 't',
      ...overrides,
    };
  }

  it('is Not Ready with no photography plan', () => {
    expect(computePhotographyReadiness([], []).level).toBe('Not Ready');
  });

  it('is Ready once coverage, restrictions, groups, and delivery are all set', () => {
    const readiness = computePhotographyReadiness(
      [plan()],
      [{ id: 'group-1', event: 'Wedding', groupName: 'Family', sequenceOrder: 1, participants: [], priority: 'Must Have', coordinator: 'Aunt', completed: false, createdAt: 't', updatedAt: 't' }],
    );
    expect(readiness.level).toBe('Ready');
  });
});

describe('music/AV readiness (section 34)', () => {
  function plan(overrides: Partial<MusicAVPlan> = {}): MusicAVPlan {
    return {
      id: 'plan-1',
      event: 'Wedding',
      emceeName: 'MC',
      soundcheckDate: '2027-01-30',
      backupMicrophones: 2,
      podiumRequired: false,
      offlinePlaylistReady: true,
      backupBatteriesReady: true,
      createdAt: 't',
      updatedAt: 't',
      ...overrides,
    };
  }

  function cue(overrides: Partial<MusicCue> = {}): MusicCue {
    return { id: 'cue-1', event: 'Wedding', cueType: 'Processional', title: 'Processional', sequenceOrder: 1, approved: true, backupAvailable: true, createdAt: 't', updatedAt: 't', ...overrides };
  }

  it('is Not Ready with no music/AV plan', () => {
    expect(computeMusicAVReadiness([], []).level).toBe('Not Ready');
  });

  it('is Ready once cues are approved and the plan is complete', () => {
    expect(computeMusicAVReadiness([plan()], [cue()]).level).toBe('Ready');
  });
});

describe('gifts & kits readiness (section 34)', () => {
  function giftPlan(overrides: Partial<GiftPlan> = {}): GiftPlan {
    return { id: 'gift-1', recipientType: 'Clergy', event: 'Wedding', giftType: 'Stole', quantity: 1, status: 'Distributed', distributionOwner: 'Bride', createdAt: 't', updatedAt: 't', ...overrides };
  }

  function kit(overrides: Partial<WelcomeKit> = {}): WelcomeKit {
    return { id: 'kit-1', name: 'Family kit', quantityPlanned: 40, quantityPrepared: 40, distributionOwner: 'Groom Mother', status: 'Packed', createdAt: 't', updatedAt: 't', ...overrides };
  }

  it('is Mostly Ready with no gift plans or kits (recipient-group checks vacuously pass with none to check)', () => {
    expect(computeGiftsKitsReadiness([], []).level).toBe('Mostly Ready');
  });

  it('is Ready once gifts and kits are ready with owners assigned', () => {
    expect(computeGiftsKitsReadiness([giftPlan()], [kit()]).level).toBe('Ready');
  });
});

describe('overall readiness (section 34)', () => {
  const ready = { level: 'Ready' as const, ratio: 1, checks: [], reasons: [] };
  const notReady = { level: 'Not Ready' as const, ratio: 0, checks: [], reasons: [] };

  it('is 100% Ready when every section is fully ready', () => {
    const overall = computeOverallReadiness({
      church: ready, ceremony: ready, catering: ready, decor: ready, attire: ready, photography: ready, musicAV: ready, giftsKits: ready,
    });
    expect(overall).toEqual({ percent: 100, level: 'Ready' });
  });

  it('is 0% Not Ready when every section is not ready', () => {
    const overall = computeOverallReadiness({
      church: notReady, ceremony: notReady, catering: notReady, decor: notReady, attire: notReady, photography: notReady, musicAV: notReady, giftsKits: notReady,
    });
    expect(overall).toEqual({ percent: 0, level: 'Not Ready' });
  });

  it('weights sections proportionally to their configured weight', () => {
    const overall = computeOverallReadiness(
      { church: ready, ceremony: notReady, catering: notReady, decor: notReady, attire: notReady, photography: notReady, musicAV: notReady, giftsKits: notReady },
      { church: 50, ceremony: 50, catering: 0, decor: 0, attire: 0, photography: 0, musicAV: 0, giftsKits: 0 },
    );
    expect(overall.percent).toBe(50);
  });

  it('uses the default weights when none are supplied', () => {
    const overall = computeOverallReadiness({
      church: ready, ceremony: notReady, catering: notReady, decor: notReady, attire: notReady, photography: notReady, musicAV: notReady, giftsKits: notReady,
    });
    const expectedPercent = Math.round((DEFAULT_WEDDING_PREP_SECTION_WEIGHTS.church / 100) * 1000) / 10;
    expect(overall.percent).toBe(expectedPercent);
  });

  it('treats an all-zero weight configuration as 0% Not Ready rather than dividing by zero', () => {
    const overall = computeOverallReadiness(
      { church: ready, ceremony: ready, catering: ready, decor: ready, attire: ready, photography: ready, musicAV: ready, giftsKits: ready },
      { church: 0, ceremony: 0, catering: 0, decor: 0, attire: 0, photography: 0, musicAV: 0, giftsKits: 0 },
    );
    expect(overall).toEqual({ percent: 0, level: 'Not Ready' });
  });
});
