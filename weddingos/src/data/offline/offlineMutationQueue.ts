import { generateId } from '@/lib/id';
import { getRuntimeSession } from '@/lib/runtimeSession';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { OfflineMutation, OfflineMutationEntityAction } from '@/types/offlineMutationQueue';
import { OFFLINE_MUTATION_MAX_RETRIES } from '@/types/offlineMutationQueue';
import { ceremonyItemMovementsStore, closeoutItemsStore, liveIssuesStore, runSheetItemsStore } from '@/data/stores';
import { getAllMutations, putMutation, deleteMutation } from './offlineDb';

function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Applies the offline-safe action to the local store immediately, using
 * `.hydrate()` (a local-only write — see lib/supabaseSync.ts's
 * `SyncedStore.hydrate`) rather than `.set()`, so this never attempts a
 * doomed network push while offline and never disturbs the sync-status
 * indicator with a spurious "error" for something that is, by design,
 * queued rather than failed. The queued `OfflineMutation` (persisted
 * separately, in IndexedDB) is what later performs the real, conflict-
 * checked push once connectivity returns.
 */
function applyLocally(action: OfflineMutationEntityAction, recordId: string, timestamp: string): { baselineUpdatedAt?: string } {
  switch (action.entityType) {
    case 'liveIssue': {
      if (action.action === 'create') {
        const issue = {
          id: recordId,
          title: action.payload.title,
          category: action.payload.category,
          severity: action.payload.severity,
          status: 'Open',
          description: action.payload.description,
          location: action.payload.location,
          reportedBy: action.payload.reportedBy,
          reportedAt: timestamp,
          followUpRequired: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as unknown as ReturnType<typeof liveIssuesStore.get>[number];
        liveIssuesStore.hydrate([...liveIssuesStore.get(), issue]);
        return {};
      }
      const existing = liveIssuesStore.get().find((i) => i.id === recordId);
      const baselineUpdatedAt = existing?.updatedAt;
      liveIssuesStore.hydrate(
        liveIssuesStore.get().map((i) =>
          i.id === recordId
            ? {
                ...i,
                status: (action.payload.status as typeof i.status) ?? i.status,
                mitigation: action.payload.mitigation ?? i.mitigation,
                updatedAt: timestamp,
              }
            : i,
        ),
      );
      return { baselineUpdatedAt };
    }
    case 'runSheetItem': {
      const existing = runSheetItemsStore.get().find((i) => i.id === recordId);
      const baselineUpdatedAt = existing?.updatedAt;
      runSheetItemsStore.hydrate(
        runSheetItemsStore.get().map((i) =>
          i.id === recordId
            ? {
                ...i,
                status: action.payload.status as typeof i.status,
                actualStartTime: action.payload.actualStartTime ?? i.actualStartTime,
                actualEndTime: action.payload.actualEndTime ?? i.actualEndTime,
                delayMinutes: action.payload.delayMinutes ?? i.delayMinutes,
                updatedAt: timestamp,
              }
            : i,
        ),
      );
      return { baselineUpdatedAt };
    }
    case 'ceremonyItemMovement': {
      const movement = {
        id: recordId,
        ceremonyItemId: action.payload.ceremonyItemId,
        action: action.payload.movementAction,
        timestamp,
        fromLocation: action.payload.fromLocation,
        toLocation: action.payload.toLocation,
        handedBy: action.payload.handedBy,
        receivedBy: action.payload.receivedBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      } as unknown as ReturnType<typeof ceremonyItemMovementsStore.get>[number];
      ceremonyItemMovementsStore.hydrate([...ceremonyItemMovementsStore.get(), movement]);
      return {};
    }
    case 'closeoutItem': {
      const existing = closeoutItemsStore.get().find((i) => i.id === recordId);
      const baselineUpdatedAt = existing?.updatedAt;
      closeoutItemsStore.hydrate(
        closeoutItemsStore.get().map((i) =>
          i.id === recordId
            ? {
                ...i,
                status: action.payload.status as typeof i.status,
                completedAt: action.payload.completedAt ?? i.completedAt,
                verificationNote: action.payload.verificationNote ?? i.verificationNote,
                updatedAt: timestamp,
              }
            : i,
        ),
      );
      return { baselineUpdatedAt };
    }
  }
}

/** Called by Wedding Day UI components in place of the normal repository function ONLY when `!navigator.onLine`. Applies the change locally right away and durably queues it for a conflict-checked replay once connectivity returns. */
export async function enqueueOfflineMutation(action: OfflineMutationEntityAction, existingRecordId?: string): Promise<OfflineMutation> {
  const { workspaceId } = getRuntimeSession();
  const timestamp = nowISO();
  const recordId = existingRecordId ?? generateId(action.entityType === 'liveIssue' ? 'issue' : action.entityType === 'ceremonyItemMovement' ? 'movement' : action.entityType);
  const { baselineUpdatedAt } = applyLocally(action, recordId, timestamp);

  const mutation: OfflineMutation = {
    ...action,
    id: generateId('offlinemut'),
    recordId,
    workspaceId: workspaceId ?? '',
    createdAt: timestamp,
    retryCount: 0,
    status: 'Pending',
    baselineUpdatedAt,
  };
  await putMutation(mutation);
  return mutation;
}

export async function listOfflineMutations(): Promise<OfflineMutation[]> {
  return getAllMutations();
}

export async function pendingOfflineMutationCount(): Promise<number> {
  const all = await getAllMutations();
  return all.filter((m) => m.status === 'Pending' || m.status === 'Failed').length;
}

function storeForEntity(entityType: OfflineMutationEntityAction['entityType']) {
  switch (entityType) {
    case 'liveIssue':
      return liveIssuesStore;
    case 'runSheetItem':
      return runSheetItemsStore;
    case 'ceremonyItemMovement':
      return ceremonyItemMovementsStore;
    case 'closeoutItem':
      return closeoutItemsStore;
  }
}

export type ReplayOutcome = { mutationId: string; result: 'synced' | 'conflict' | 'failed' | 'discarded' };

/**
 * Replays every Pending/Failed queued mutation in creation order against
 * Supabase directly (bypassing the generic optimistic diff-push, since
 * each queued mutation needs its own conflict check against the specific
 * record it targets). Never overwrites a record that changed on the
 * server after this mutation was queued — those are left in `Conflict`
 * status for the user to resolve explicitly.
 */
export async function replayOfflineMutationQueue(): Promise<ReplayOutcome[]> {
  const client = getSupabaseClient();
  const { workspaceId, userId } = getRuntimeSession();
  const outcomes: ReplayOutcome[] = [];
  if (!client || !workspaceId) return outcomes;

  const queued = (await getAllMutations()).filter((m) => m.status === 'Pending' || m.status === 'Failed');
  for (const mutation of queued) {
    const store = storeForEntity(mutation.entityType);
    const record = store.get().find((r) => r.id === mutation.recordId);
    if (!record) {
      await deleteMutation(mutation.id);
      outcomes.push({ mutationId: mutation.id, result: 'discarded' });
      continue;
    }

    await putMutation({ ...mutation, status: 'Syncing' });

    try {
      if (mutation.baselineUpdatedAt) {
        const { data, error } = await client.from(store.map.table).select('updated_at').eq('id', mutation.recordId).maybeSingle();
        if (error) throw error;
        const serverUpdatedAt = data && typeof (data as Record<string, unknown>).updated_at === 'string' ? ((data as Record<string, unknown>).updated_at as string) : undefined;
        if (serverUpdatedAt && serverUpdatedAt > mutation.baselineUpdatedAt) {
          await putMutation({ ...mutation, status: 'Conflict' });
          outcomes.push({ mutationId: mutation.id, result: 'conflict' });
          continue;
        }
      }

      const row = store.map.toRow(record as never, workspaceId, userId);
      const { error } = await client.from(store.map.table).upsert(row);
      if (error) throw error;

      await deleteMutation(mutation.id);
      outcomes.push({ mutationId: mutation.id, result: 'synced' });
    } catch (err) {
      const retryCount = mutation.retryCount + 1;
      const lastError = err instanceof Error ? err.message : 'Sync failed';
      if (retryCount >= OFFLINE_MUTATION_MAX_RETRIES) {
        await putMutation({ ...mutation, status: 'Failed', retryCount, lastError });
      } else {
        await putMutation({ ...mutation, status: 'Pending', retryCount, lastError });
      }
      outcomes.push({ mutationId: mutation.id, result: 'failed' });
    }
  }
  return outcomes;
}

/** Applies the server's version and discards the queued offline change — used by the conflict-resolution "Keep Server" action. */
export async function resolveConflictKeepServer(mutationId: string): Promise<void> {
  await deleteMutation(mutationId);
}

/** Re-queues the same offline change with a refreshed baseline so it's pushed on the next replay regardless of the newer server value — used by "Apply My Change". */
export async function resolveConflictApplyMine(mutationId: string): Promise<void> {
  const all = await getAllMutations();
  const mutation = all.find((m) => m.id === mutationId);
  if (!mutation) return;
  await putMutation({ ...mutation, status: 'Pending', baselineUpdatedAt: undefined });
}

export async function discardOfflineMutation(mutationId: string): Promise<void> {
  await deleteMutation(mutationId);
}

export async function manualRetryOfflineMutation(mutationId: string): Promise<void> {
  const all = await getAllMutations();
  const mutation = all.find((m) => m.id === mutationId);
  if (!mutation) return;
  await putMutation({ ...mutation, status: 'Pending', retryCount: 0 });
}
