export const DECISION_STATUSES = ['Open', 'Under Discussion', 'Decided', 'Deferred'] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export interface Decision {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
  approver?: string;
  options: string[];
  recommendedOption?: string;
  deadline?: string;
  status: DecisionStatus;
  finalDecision?: string;
  decisionDate?: string;
  notes?: string;
  relatedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}
