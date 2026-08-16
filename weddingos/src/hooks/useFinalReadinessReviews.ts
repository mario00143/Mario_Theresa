import { useCallback } from 'react';
import { finalReadinessReviewsStore } from '@/data/stores';
import { addFinalReadinessReview, deleteFinalReadinessReview, type NewFinalReadinessReviewInput } from '@/data/repositories/finalReadinessReviewRepository';
import { useStoreValue } from './useStore';

export function useFinalReadinessReviews() {
  const reviews = useStoreValue(finalReadinessReviewsStore);

  return {
    finalReadinessReviews: reviews,
    addFinalReadinessReview: useCallback((input: NewFinalReadinessReviewInput) => addFinalReadinessReview(input), []),
    deleteFinalReadinessReview: useCallback((id: string) => deleteFinalReadinessReview(id), []),
  };
}
