/**
 * Section 12: the ONLY entity/action pairs that may ever be queued while
 * offline. Nothing else — no payments, no role changes, no deletes, no
 * capacity-changing assignments — can be constructed into a queued
 * mutation, because `OfflineMutationInput` below is a closed union, not a
 * generic `{ table, payload }` bag. This is what makes "no arbitrary
 * mutation replay" (section 15) a type-level guarantee, not a policy.
 */
export type OfflineMutationEntityAction =
  | { entityType: 'liveIssue'; action: 'create'; payload: { title: string; category: string; severity: string; description?: string; location?: string; reportedBy?: string } }
  | { entityType: 'liveIssue'; action: 'updateStatusOrMitigation'; payload: { status?: string; mitigation?: string } }
  | { entityType: 'runSheetItem'; action: 'updateStatus'; payload: { status: string; actualStartTime?: string; actualEndTime?: string; delayMinutes?: number } }
  | {
      entityType: 'ceremonyItemMovement';
      action: 'create';
      payload: { ceremonyItemId: string; movementAction: string; fromLocation?: string; toLocation?: string; handedBy?: string; receivedBy?: string };
    }
  | { entityType: 'closeoutItem'; action: 'updateStatus'; payload: { status: string; completedAt?: string; verificationNote?: string } };

export type OfflineMutationStatus = 'Pending' | 'Syncing' | 'Failed' | 'Synced' | 'Discarded' | 'Conflict';

export type OfflineMutation = OfflineMutationEntityAction & {
  id: string;
  /** The id of the local record this mutation targets — for `create` actions this id is minted at enqueue time and used for both the immediate local insert and the eventual server upsert, so replay is idempotent. */
  recordId: string;
  workspaceId: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  status: OfflineMutationStatus;
  /** The target record's `updatedAt` at the moment this mutation was queued — the baseline replay compares against the live server value to detect a conflict. Absent for `create` (nothing to conflict with). */
  baselineUpdatedAt?: string;
};

export const OFFLINE_MUTATION_MAX_RETRIES = 3;

export const OFFLINE_MUTATION_LABELS: Record<OfflineMutationEntityAction['entityType'], string> = {
  liveIssue: 'Live Issue',
  runSheetItem: 'Run Sheet Item',
  ceremonyItemMovement: 'Ceremony Item Movement',
  closeoutItem: 'Closeout Item',
};
