export const CHURCH_REQUIREMENT_CATEGORIES = [
  'Marriage Preparation',
  'Baptism',
  'Confirmation',
  'Parish Membership',
  'Freedom to Marry',
  'NOC / Transfer',
  'Banns / Notice',
  'Inter-Parish Permission',
  'Inter-Denominational Permission',
  'Witnesses',
  'Church Fees',
  'Rehearsal',
  'Marriage Register',
  'Marriage Certificate',
  'Civil Registration',
  'Other',
] as const;
export type ChurchRequirementCategory = (typeof CHURCH_REQUIREMENT_CATEGORIES)[number];

/** Shared "may not apply to this denomination/parish" applicability, distinct wording per entity per spec. */
export const CHURCH_APPLICABILITY = ['Applicable', 'Not Applicable', 'Confirm with Parish'] as const;
export type ChurchApplicability = (typeof CHURCH_APPLICABILITY)[number];

/** Statuses that count as "done" for overdue/incomplete checks. */
export const CHURCH_REQUIREMENT_DONE_STATUSES = ['Complete', 'Verified', 'Not Applicable'] as const;

/** Default critical categories for the "ceremony date approaching, critical requirement incomplete" warning. */
export const DEFAULT_CRITICAL_CHURCH_REQUIREMENT_CATEGORIES: ChurchRequirementCategory[] = [
  'Freedom to Marry',
  'Banns / Notice',
  'Witnesses',
  'Marriage Register',
  'Marriage Certificate',
  'Civil Registration',
];

export const CHURCH_REQUIREMENT_STATUSES = [
  'Not Started',
  'In Progress',
  'Waiting',
  'Submitted',
  'Verified',
  'Complete',
  'Blocked',
  'Not Applicable',
] as const;
export type ChurchRequirementStatus = (typeof CHURCH_REQUIREMENT_STATUSES)[number];

export interface ChurchRequirement {
  id: string;
  churchProfileId: string;
  title: string;
  category: ChurchRequirementCategory;
  applicability: ChurchApplicability;
  owner?: string;
  dueDate?: string;
  status: ChurchRequirementStatus;
  requirementSource?: string;
  documentRequired: boolean;
  documentName?: string;
  submittedDate?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  notes?: string;
  relatedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}
