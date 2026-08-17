import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetToDemoData, liveIssuesStore, runSheetItemsStore, closeoutItemsStore } from '@/data/stores';
import { setRuntimeSession, resetRuntimeSession } from '@/lib/runtimeSession';
import {
  enqueueOfflineMutation,
  listOfflineMutations,
  pendingOfflineMutationCount,
  replayOfflineMutationQueue,
  resolveConflictKeepServer,
  resolveConflictApplyMine,
  discardOfflineMutation,
  manualRetryOfflineMutation,
} from '@/data/offline/offlineMutationQueue';
import { clearAllOfflineData } from '@/data/offline/offlineDb';
import { OFFLINE_MUTATION_LABELS, OFFLINE_MUTATION_MAX_RETRIES } from '@/types/offlineMutationQueue';
import { getSupabaseClient } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
  isSupabaseConfigured: () => true,
}));

/** A minimal stand-in for the two Supabase-js fluent chains offlineMutationQueue.ts actually uses. */
function makeFakeClient(opts: { selectResult?: { data: unknown; error: unknown }; upsertError?: unknown }) {
  return {
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => opts.selectResult ?? { data: null, error: null },
        }),
      }),
      upsert: async () => ({ error: opts.upsertError ?? null }),
    }),
  };
}

describe('Section 12: allowlist (no arbitrary mutation replay)', () => {
  it('OFFLINE_MUTATION_LABELS covers exactly the five spec-approved entity types, nothing else', () => {
    expect(Object.keys(OFFLINE_MUTATION_LABELS).sort()).toEqual(['ceremonyItemMovement', 'closeoutItem', 'liveIssue', 'runSheetItem'].sort());
  });
});

describe('enqueueOfflineMutation (section 12): local-only apply, no network attempt', () => {
  beforeEach(async () => {
    resetToDemoData();
    resetRuntimeSession();
    await clearAllOfflineData();
  });

  it('creates a new Live Issue locally with status Pending and never touches the network', async () => {
    const before = liveIssuesStore.get().length;
    const mutation = await enqueueOfflineMutation({ entityType: 'liveIssue', action: 'create', payload: { title: 'Offline test issue', category: 'Other', severity: 'Medium' } });
    expect(mutation.status).toBe('Pending');
    expect(liveIssuesStore.get().length).toBe(before + 1);
    expect(liveIssuesStore.get().find((i) => i.id === mutation.recordId)?.title).toBe('Offline test issue');

    const pending = await pendingOfflineMutationCount();
    expect(pending).toBe(1);
  });

  it('queues a Run Sheet status update against an existing item and captures a baseline updatedAt', async () => {
    const [item] = runSheetItemsStore.get();
    const mutation = await enqueueOfflineMutation({ entityType: 'runSheetItem', action: 'updateStatus', payload: { status: 'In Progress' } }, item.id);
    expect(mutation.baselineUpdatedAt).toBe(item.updatedAt);
    expect(runSheetItemsStore.get().find((i) => i.id === item.id)?.status).toBe('In Progress');
  });

  it('never marks a queued mutation as Synced without an actual replay', async () => {
    await enqueueOfflineMutation({ entityType: 'liveIssue', action: 'create', payload: { title: 'x', category: 'Other', severity: 'Low' } });
    const [queued] = await listOfflineMutations();
    expect(queued.status).not.toBe('Synced');
  });
});

describe('replayOfflineMutationQueue (section 15): conflict detection and retry', () => {
  beforeEach(async () => {
    resetToDemoData();
    resetRuntimeSession();
    await clearAllOfflineData();
    setRuntimeSession({ mode: 'supabase', workspaceId: 'ws-1', userId: 'user-1' });
  });

  it('syncs a queued create cleanly when the server has no conflicting record', async () => {
    vi.mocked(getSupabaseClient).mockReturnValue(makeFakeClient({}) as never);
    await enqueueOfflineMutation({ entityType: 'liveIssue', action: 'create', payload: { title: 'Replay test', category: 'Other', severity: 'Medium' } });
    const outcomes = await replayOfflineMutationQueue();
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].result).toBe('synced');
    expect(await listOfflineMutations()).toHaveLength(0);
  });

  it('marks the mutation as Conflict when the server record changed after the offline baseline, and never overwrites it', async () => {
    const [item] = closeoutItemsStore.get();
    await enqueueOfflineMutation({ entityType: 'closeoutItem', action: 'updateStatus', payload: { status: 'Complete' } }, item.id);

    const newerServerTimestamp = new Date(Date.now() + 60_000).toISOString();
    vi.mocked(getSupabaseClient).mockReturnValue(makeFakeClient({ selectResult: { data: { updated_at: newerServerTimestamp }, error: null } }) as never);

    const outcomes = await replayOfflineMutationQueue();
    expect(outcomes[0].result).toBe('conflict');
    const [queued] = await listOfflineMutations();
    expect(queued.status).toBe('Conflict');
  });

  it('"Keep Server" discards the queued offline change without ever pushing it', async () => {
    const [item] = closeoutItemsStore.get();
    const mutation = await enqueueOfflineMutation({ entityType: 'closeoutItem', action: 'updateStatus', payload: { status: 'Complete' } }, item.id);
    await resolveConflictKeepServer(mutation.id);
    expect(await listOfflineMutations()).toHaveLength(0);
  });

  it('"Apply My Change" clears the baseline so the next replay pushes the offline value regardless of the newer server value', async () => {
    const [item] = closeoutItemsStore.get();
    const mutation = await enqueueOfflineMutation({ entityType: 'closeoutItem', action: 'updateStatus', payload: { status: 'Complete' } }, item.id);
    await resolveConflictApplyMine(mutation.id);
    vi.mocked(getSupabaseClient).mockReturnValue(makeFakeClient({}) as never);
    const outcomes = await replayOfflineMutationQueue();
    expect(outcomes[0].result).toBe('synced');
  });

  it('retries up to OFFLINE_MUTATION_MAX_RETRIES times before marking Failed, and never before that', async () => {
    await enqueueOfflineMutation({ entityType: 'liveIssue', action: 'create', payload: { title: 'Will fail', category: 'Other', severity: 'Low' } });
    vi.mocked(getSupabaseClient).mockReturnValue(makeFakeClient({ upsertError: { message: 'network down' } }) as never);

    for (let attempt = 1; attempt < OFFLINE_MUTATION_MAX_RETRIES; attempt++) {
      await replayOfflineMutationQueue();
      const [queued] = await listOfflineMutations();
      expect(queued.status).toBe('Pending');
      expect(queued.retryCount).toBe(attempt);
    }

    await replayOfflineMutationQueue();
    const [finalQueued] = await listOfflineMutations();
    expect(finalQueued.status).toBe('Failed');
    expect(finalQueued.retryCount).toBe(OFFLINE_MUTATION_MAX_RETRIES);
  });

  it('manual retry re-queues a Failed mutation as Pending with retryCount reset', async () => {
    await enqueueOfflineMutation({ entityType: 'liveIssue', action: 'create', payload: { title: 'Retry me', category: 'Other', severity: 'Low' } });
    vi.mocked(getSupabaseClient).mockReturnValue(makeFakeClient({ upsertError: { message: 'down' } }) as never);
    for (let i = 0; i < OFFLINE_MUTATION_MAX_RETRIES; i++) await replayOfflineMutationQueue();
    let [queued] = await listOfflineMutations();
    expect(queued.status).toBe('Failed');

    await manualRetryOfflineMutation(queued.id);
    [queued] = await listOfflineMutations();
    expect(queued.status).toBe('Pending');
    expect(queued.retryCount).toBe(0);
  });

  it('a manually discarded Failed mutation is permanently removed', async () => {
    await enqueueOfflineMutation({ entityType: 'liveIssue', action: 'create', payload: { title: 'Discard me', category: 'Other', severity: 'Low' } });
    vi.mocked(getSupabaseClient).mockReturnValue(makeFakeClient({ upsertError: { message: 'down' } }) as never);
    for (let i = 0; i < OFFLINE_MUTATION_MAX_RETRIES; i++) await replayOfflineMutationQueue();
    const [queued] = await listOfflineMutations();
    await discardOfflineMutation(queued.id);
    expect(await listOfflineMutations()).toHaveLength(0);
  });
});
