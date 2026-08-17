import { describe, expect, it, beforeEach } from 'vitest';
import { resetToDemoData } from '@/data/stores';
import { generateOfflineSnapshot, refreshOfflineSnapshot, loadOfflineSnapshot, discardOfflineSnapshot, isOfflineSnapshotStale, offlineSnapshotAgeMs } from '@/data/offline/offlineSnapshot';
import { OFFLINE_SNAPSHOT_SCHEMA_VERSION } from '@/lib/appVersion';

describe('OfflineSnapshot generation (section 9)', () => {
  beforeEach(() => resetToDemoData());

  it('includes every critical read-only offline data category with a generated timestamp and schema version', () => {
    const snapshot = generateOfflineSnapshot();
    expect(snapshot.id).toBe('current');
    expect(snapshot.schemaVersion).toBe(OFFLINE_SNAPSHOT_SCHEMA_VERSION);
    expect(new Date(snapshot.generatedAt).toString()).not.toBe('Invalid Date');
    expect(Array.isArray(snapshot.runSheet)).toBe(true);
    expect(Array.isArray(snapshot.emergencyContacts)).toBe(true);
    expect(Array.isArray(snapshot.vendorContacts)).toBe(true);
    expect(Array.isArray(snapshot.closeoutItems)).toBe(true);
    expect(Array.isArray(snapshot.openCriticalIssues)).toBe(true);
    expect(Array.isArray(snapshot.roomingList)).toBe(true);
    expect(Array.isArray(snapshot.vipAssistance)).toBe(true);
    expect(snapshot.manifests.guestArrival).toBeDefined();
    expect(snapshot.manifests.churchShuttle).toBeDefined();
    expect(snapshot.manifests.receptionShuttle).toBeDefined();
    expect(snapshot.manifests.departure).toBeDefined();
    expect(snapshot.venueDetails.timezone).toBeTypeOf('string');
  });

  it('only includes High/Critical severity issues that are still open in openCriticalIssues', () => {
    const snapshot = generateOfflineSnapshot();
    for (const issue of snapshot.openCriticalIssues) {
      expect(['High', 'Critical']).toContain(issue.severity);
      expect(['Open', 'Investigating', 'Mitigating']).toContain(issue.status);
    }
  });

  it('is JSON-serializable (a real requirement for IndexedDB structured-clone storage)', () => {
    const snapshot = generateOfflineSnapshot();
    const serialized = JSON.stringify(snapshot);
    const parsed = JSON.parse(serialized);
    expect(parsed.id).toBe('current');
    expect(parsed.runSheet.length).toBe(snapshot.runSheet.length);
  });
});

describe('Offline Pack staleness (section 10)', () => {
  it('is not stale immediately after generation', () => {
    const snapshot = { generatedAt: new Date().toISOString() };
    expect(isOfflineSnapshotStale(snapshot)).toBe(false);
  });

  it('is stale after the default 6-hour threshold', () => {
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();
    expect(isOfflineSnapshotStale({ generatedAt: sevenHoursAgo })).toBe(true);
  });

  it('respects a custom threshold', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(isOfflineSnapshotStale({ generatedAt: twoHoursAgo }, new Date(), 1)).toBe(true);
    expect(isOfflineSnapshotStale({ generatedAt: twoHoursAgo }, new Date(), 3)).toBe(false);
  });

  it('offlineSnapshotAgeMs is non-negative and grows with elapsed time', () => {
    const generatedAt = new Date(Date.now() - 60_000).toISOString();
    const age = offlineSnapshotAgeMs({ generatedAt });
    expect(age).toBeGreaterThanOrEqual(59_000);
  });
});

describe('Offline Pack IndexedDB persistence (section 9-10)', () => {
  beforeEach(async () => {
    resetToDemoData();
    await discardOfflineSnapshot();
  });

  it('round-trips through refreshOfflineSnapshot/loadOfflineSnapshot', async () => {
    expect(await loadOfflineSnapshot()).toBeUndefined();
    const written = await refreshOfflineSnapshot();
    expect(written).not.toBeNull();
    const loaded = await loadOfflineSnapshot();
    expect(loaded?.generatedAt).toBe(written?.generatedAt);
    expect(loaded?.runSheet.length).toBe(written?.runSheet.length);
  });

  it('discardOfflineSnapshot clears the saved pack', async () => {
    await refreshOfflineSnapshot();
    expect(await loadOfflineSnapshot()).toBeDefined();
    await discardOfflineSnapshot();
    expect(await loadOfflineSnapshot()).toBeUndefined();
  });

  it('refreshing again replaces the previous snapshot rather than accumulating (fixed id, single record)', async () => {
    await refreshOfflineSnapshot();
    const second = await refreshOfflineSnapshot();
    const loaded = await loadOfflineSnapshot();
    expect(loaded?.id).toBe('current');
    expect(loaded?.generatedAt).toBe(second?.generatedAt);
  });
});
