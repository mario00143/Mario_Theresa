import { describe, expect, it } from 'vitest';
import { exportBackup } from '@/data/repositories/backupRepository';
import { resetToDemoData } from '@/data/stores';
import { computeLocalDataFingerprint, getLocalRecordCounts, validateReferences } from '@/data/migration/migrationEngine';
import { MIGRATION_ORDER } from '@/data/migration/migrationOrder';
import { LEGACY_ENTITY_TABLES } from '@/data/supabase/entityRegistry';

describe('MIGRATION_ORDER (section 34)', () => {
  it('covers exactly the same set of collections as the legacy entity table registry', () => {
    expect(new Set(MIGRATION_ORDER)).toEqual(new Set(Object.keys(LEGACY_ENTITY_TABLES)));
  });

  it('places households before guests, and guests before travel/room/transport records that reference them', () => {
    const index = (key: string) => MIGRATION_ORDER.indexOf(key as (typeof MIGRATION_ORDER)[number]);
    expect(index('households')).toBeLessThan(index('guests'));
    expect(index('guests')).toBeLessThan(index('travelSegments'));
    expect(index('guests')).toBeLessThan(index('roomAssignments'));
    expect(index('guests')).toBeLessThan(index('transportAssignments'));
    expect(index('hotels')).toBeLessThan(index('roomTypes'));
    expect(index('roomTypes')).toBeLessThan(index('rooms'));
    expect(index('rooms')).toBeLessThan(index('roomAssignments'));
    expect(index('vendors')).toBeLessThan(index('vendorContacts'));
    expect(index('budgetCategories')).toBeLessThan(index('budgetItems'));
  });
});

describe('computeLocalDataFingerprint (section 32)', () => {
  it('is deterministic for the same content', async () => {
    resetToDemoData();
    const backup = exportBackup();
    const fp1 = await computeLocalDataFingerprint(backup);
    const fp2 = await computeLocalDataFingerprint(backup);
    expect(fp1).toBe(fp2);
  });

  it('ignores exportedAt so re-exporting identical data produces the same fingerprint', async () => {
    resetToDemoData();
    const backupA = exportBackup();
    // Simulate a later export of the identical dataset with a different timestamp.
    const backupB = { ...backupA, exportedAt: new Date(Date.now() + 60_000).toISOString() };
    const fpA = await computeLocalDataFingerprint(backupA);
    const fpB = await computeLocalDataFingerprint(backupB);
    expect(fpA).toBe(fpB);
  });

  it('changes when the data actually changes', async () => {
    resetToDemoData();
    const before = exportBackup();
    const fpBefore = await computeLocalDataFingerprint(before);
    const after = { ...before, tasks: [...before.tasks, before.tasks[0]] };
    const fpAfter = await computeLocalDataFingerprint(after);
    expect(fpAfter).not.toBe(fpBefore);
  });
});

describe('getLocalRecordCounts', () => {
  it('returns a count for every collection in MIGRATION_ORDER matching the backup array lengths', () => {
    resetToDemoData();
    const backup = exportBackup();
    const counts = getLocalRecordCounts(backup);
    expect(Object.keys(counts).sort()).toEqual([...MIGRATION_ORDER].sort());
    for (const key of MIGRATION_ORDER) {
      expect(counts[key]).toBe((backup[key] as unknown[]).length);
    }
  });
});

describe('validateReferences (section 31)', () => {
  it('flags the seed data\'s deliberate "Unlinked Guest Record" data-quality scenario (household.seed.ts) and nothing else', () => {
    resetToDemoData();
    const backup = exportBackup();
    const problems = validateReferences(backup);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('Unlinked Guest Record');
  });

  it('finds no problems once the deliberately-broken seed guest is removed', () => {
    resetToDemoData();
    const backup = exportBackup();
    const cleaned = { ...backup, guests: backup.guests.filter((g) => g.fullName !== 'Unlinked Guest Record') };
    expect(validateReferences(cleaned)).toEqual([]);
  });

  it('flags a guest referencing a household that does not exist', () => {
    resetToDemoData();
    const backup = exportBackup();
    const broken = { ...backup, guests: [...backup.guests, { ...backup.guests[0], id: 'guest-broken', householdId: 'missing-household' }] };
    const problems = validateReferences(broken);
    expect(problems.some((p) => p.includes('missing-household'))).toBe(true);
  });

  it('flags a payment referencing a vendor that does not exist', () => {
    resetToDemoData();
    const backup = exportBackup();
    const broken = { ...backup, payments: [...backup.payments, { ...backup.payments[0], id: 'payment-broken', vendorId: 'missing-vendor' }] };
    const problems = validateReferences(broken);
    expect(problems.some((p) => p.includes('missing-vendor'))).toBe(true);
  });
});
