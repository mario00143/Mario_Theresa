import type { FinalReadinessReview } from '@/types';
import { generateId } from '@/lib/id';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import { finalReadinessReviewsStore } from '../stores';

export type NewFinalReadinessReviewInput = Omit<FinalReadinessReview, 'id' | 'createdAt' | 'updatedAt' | 'reviewedAt'> & Partial<Pick<FinalReadinessReview, 'reviewedAt'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addFinalReadinessReview(input: NewFinalReadinessReviewInput): FinalReadinessReview {
  const timestamp = nowISO();
  const review: FinalReadinessReview = {
    ...input,
    reviewedAt: input.reviewedAt ?? timestamp,
    id: generateId('readinessreview'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  finalReadinessReviewsStore.set((prev) => [...prev, review]);
  logAuditAction({
    action: 'finalReadinessReview.create',
    entityType: 'FinalReadinessReview',
    entityId: review.id,
    summary: `${review.reviewedBy} reviewed final readiness (${review.unresolvedExceptions.length} unresolved exception${review.unresolvedExceptions.length === 1 ? '' : 's'})`,
  });
  return review;
}

export function deleteFinalReadinessReview(id: string): void {
  finalReadinessReviewsStore.set((prev) => prev.filter((r) => r.id !== id));
}
