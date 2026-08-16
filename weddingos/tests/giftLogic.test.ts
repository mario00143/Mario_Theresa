import { describe, expect, it } from 'vitest';
import type { GiftPlan, WelcomeKit } from '@/types';
import { computeGiftPlanWarnings, computeWelcomeKitWarnings, isGuestFavorCountInsufficient, isWelcomeKitLateForArrival } from '@/utils/giftLogic';

function giftPlan(overrides: Partial<GiftPlan> = {}): GiftPlan {
  return {
    id: 'gift-1',
    recipientType: 'Groom Parents',
    event: 'Wedding',
    giftType: 'Watch',
    quantity: 1,
    status: 'Planned',
    distributionOwner: 'Bride',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function kit(overrides: Partial<WelcomeKit> = {}): WelcomeKit {
  return {
    id: 'kit-1',
    name: 'Family kit',
    quantityPlanned: 40,
    quantityPrepared: 40,
    distributionOwner: 'Groom Mother',
    status: 'Planned',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('gift plan warnings (section 32)', () => {
  it('flags a missing distribution owner', () => {
    expect(computeGiftPlanWarnings(giftPlan({ distributionOwner: undefined }), '2027-01-30')).toContain('Distribution owner missing.');
  });

  it('flags an important family gift not Ready within 7 days of the wedding', () => {
    const warnings = computeGiftPlanWarnings(giftPlan({ recipientType: 'Bride Parents', status: 'Planned' }), '2027-01-30', '2027-01-25');
    expect(warnings).toContain('Important family gift not Ready within 7 days of the wedding.');
  });

  it('does not flag a family gift far ahead of the wedding', () => {
    const warnings = computeGiftPlanWarnings(giftPlan({ recipientType: 'Bride Parents', status: 'Planned' }), '2027-01-30', '2026-06-01');
    expect(warnings).not.toContain('Important family gift not Ready within 7 days of the wedding.');
  });

  it('does not flag a family gift once it is Received or beyond', () => {
    const warnings = computeGiftPlanWarnings(giftPlan({ recipientType: 'Bride Parents', status: 'Received' }), '2027-01-30', '2027-01-25');
    expect(warnings).not.toContain('Important family gift not Ready within 7 days of the wedding.');
  });

  it('always flags an unresolved Clergy gift', () => {
    const warnings = computeGiftPlanWarnings(giftPlan({ recipientType: 'Clergy', status: 'Planned' }), '2027-01-30', '2026-06-01');
    expect(warnings).toContain('Clergy gift unresolved.');
  });

  it('does not flag a Clergy gift once ordered', () => {
    const warnings = computeGiftPlanWarnings(giftPlan({ recipientType: 'Clergy', status: 'Ordered' }), '2027-01-30', '2026-06-01');
    expect(warnings).not.toContain('Clergy gift unresolved.');
  });
});

describe('guest favor sufficiency (section 32)', () => {
  it('flags a total favor quantity below confirmed attendance plus buffer', () => {
    const plans = [giftPlan({ recipientType: 'Guests', quantity: 40 })];
    expect(isGuestFavorCountInsufficient(plans, 55, 10)).toBe(true);
  });

  it('does not flag once the quantity covers attendance plus buffer', () => {
    const plans = [giftPlan({ recipientType: 'Guests', quantity: 65 })];
    expect(isGuestFavorCountInsufficient(plans, 55, 10)).toBe(false);
  });

  it('only sums guest-recipient gift plans', () => {
    const plans = [giftPlan({ recipientType: 'Guests', quantity: 30 }), giftPlan({ recipientType: 'Clergy', quantity: 100 })];
    expect(isGuestFavorCountInsufficient(plans, 55, 10)).toBe(true);
  });
});

describe('welcome kit warnings (section 32)', () => {
  it('flags quantity prepared below the confirmed target when supplied', () => {
    const warnings = computeWelcomeKitWarnings(kit({ quantityPrepared: 20 }), 40);
    expect(warnings).toContain('Quantity prepared is below the confirmed target guest count.');
  });

  it('falls back to the planned quantity when no target is supplied', () => {
    const warnings = computeWelcomeKitWarnings(kit({ quantityPlanned: 40, quantityPrepared: 25 }));
    expect(warnings).toContain('Quantity prepared is below the planned quantity.');
  });

  it('does not flag a fully prepared kit', () => {
    const warnings = computeWelcomeKitWarnings(kit({ quantityPlanned: 40, quantityPrepared: 40 }));
    expect(warnings).not.toContain('Quantity prepared is below the planned quantity.');
  });

  it('flags a missing distribution owner', () => {
    const warnings = computeWelcomeKitWarnings(kit({ distributionOwner: undefined }));
    expect(warnings).toContain('Distribution owner missing.');
  });
});

describe('welcome kit late for arrival (section 32)', () => {
  it('flags a kit not delivered once the earliest arrival date has passed', () => {
    expect(isWelcomeKitLateForArrival(kit({ status: 'Packed' }), '2027-01-25', '2027-01-26')).toBe(true);
  });

  it('does not flag a delivered kit', () => {
    expect(isWelcomeKitLateForArrival(kit({ status: 'Delivered' }), '2027-01-25', '2027-01-26')).toBe(false);
  });

  it('does not flag before the earliest arrival date', () => {
    expect(isWelcomeKitLateForArrival(kit({ status: 'Packed' }), '2027-01-25', '2027-01-20')).toBe(false);
  });

  it('does not flag when no earliest arrival date is known', () => {
    expect(isWelcomeKitLateForArrival(kit({ status: 'Packed' }), undefined, '2027-01-26')).toBe(false);
  });
});
