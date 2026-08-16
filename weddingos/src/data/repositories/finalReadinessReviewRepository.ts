import type { FinalReadinessReview } from '@/types';
import { generateId } from '@/lib/id';
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
  return review;
}

export function deleteFinalReadinessReview(id: string): void {
  finalReadinessReviewsStore.set((prev) => prev.filter((r) => r.id !== id));
}
