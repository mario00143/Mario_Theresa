export interface FinalReadinessException {
  label: string;
  detail: string;
}

/** A single readiness metric captured at review time, e.g. "Critical tasks complete: 18/20". */
export interface FinalReadinessSnapshotItem {
  label: string;
  ready: boolean;
  detail: string;
}

/** A point-in-time snapshot of the pre-wedding readiness checklist (section 29), captured when the user reviews it. */
export interface FinalReadinessReview {
  id: string;
  reviewedAt: string;
  reviewedBy: string;
  readinessSnapshot: FinalReadinessSnapshotItem[];
  unresolvedExceptions: FinalReadinessException[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
